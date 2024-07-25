import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoHeader from '../components/LogoHeader';
import AppleMap from '../components/AppleMap';
import { dummyItems } from '../data/dummyItems';

const { width } = Dimensions.get('window');

const formatPrice = price => {
    return new Intl.NumberFormat('ko-KR').format(price);
};

const Home = () => {
    const [focusedItem, setFocusedItem] = useState(null);
    const [sortedItems, setSortedItems] = useState([]);

    useEffect(() => {
        loadLocationAndSortItems();
    }, []);

    const loadLocationAndSortItems = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('userLocation');
            if (savedLocation) {
                const { latitude, longitude } = JSON.parse(savedLocation);
                sortItemsByDistance(latitude, longitude);
            } else {
                console.log('위치 정보 없음');
                setSortedItems(dummyItems);
            }
        } catch (e) {
            console.error('저장된 위치 load 실패', e);
            setSortedItems(dummyItems);
        }
    };

    const sortItemsByDistance = (userLat, userLon) => {
        const itemsWidthDistance = dummyItems.map(item => {
            const distance = calculateDistance(
                userLat,
                userLon,
                item.location.latitude,
                item.location.longitude,
            );
            return { ...item, distance };
        });

        const sorted = itemsWidthDistance.sort((a, b) => a.distance - b.distance);
        setSortedItems(sorted);
        setFocusedItem(sorted[0].id);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleScroll = e => {
        const contentOffset = e.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / (width * 0.8));
        if (sortedItems[index]) {
            setFocusedItem(sortedItems[index].id);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
            <LogoHeader />
            <View style={{ flex: 1 }}>
                <AppleMap />
                <View style={styles.itemContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}>
                        {sortedItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.itemCard,
                                    focusedItem === item.id && styles.focusedCard,
                                ]}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <View style={{ flex: 1, marginRight: 15 }}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.itemContent} numberOfLines={2}>
                                            {item.content}
                                        </Text>
                                        <Text style={styles.itemPrice}>
                                            {formatPrice(item.price)}원
                                        </Text>
                                    </View>
                                    <Image source={item.images[0]} style={styles.itemImg} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        position: 'absolute',
        bottom: 30,
        height: 150,
    },
    itemCard: {
        width: width * 0.8,
        height: 130,
        marginHorizontal: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 5,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    itemImg: {
        width: 100,
        height: 100,
        borderRadius: 200,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1D3FC6',
        marginBottom: 10,
    },
    itemContent: {
        fontSize: 14,
        marginBottom: 15,
        color: '#555',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3572EF',
    },
    focusedCard: {
        borderWidth: 2,
        borderColor: '#A7E6FF',
    },
});

export default Home;
