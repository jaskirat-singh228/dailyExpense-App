import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { format, startOfMonth, setMonth, setYear } from 'date-fns';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

const MonthSelectorWithYear = ({ selectedDate, onMonthSelect }) => {
    const [yearOffset, setYearOffset] = useState(0);
    const currentYear = new Date().getFullYear() + yearOffset;
    const baseDate = setYear(new Date(), currentYear);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setYearOffset((prev) => prev - 1)}>
                    <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>{currentYear}</Text>
                <TouchableOpacity onPress={() => setYearOffset((prev) => prev + 1)}>
                    <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={MONTHS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                contentContainerStyle={styles.monthList}
                renderItem={({ item: monthIndex }) => {
                    const monthDate = startOfMonth(setMonth(baseDate, monthIndex));
                    const isSelected = format(monthDate, 'yyyy-MM') === format(selectedDate, 'yyyy-MM');

                    return (
                        <TouchableOpacity
                            style={[styles.monthItem, isSelected && styles.selectedMonthItem]}
                            onPress={() => onMonthSelect(monthDate)}
                        ><Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>{format(monthDate, 'MMM')}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        marginTop: 90
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 15,
    },
    arrow: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    monthList: {
        paddingHorizontal: 10,
    },
    monthItem: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedMonthItem: {
        backgroundColor: 'orange',
    },
    monthText: {
        fontSize: 18,
        color: '#000000',
    },
    selectedMonthText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default MonthSelectorWithYear;
