import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { addQty, deleteQty, getQtysRealtime } from "../services/repositories/FirebaseRepository";
import ActionSheet from "react-native-actions-sheet";
import Header from "../components/Header";
import { IMAGES } from "../utills/ImagePath";
import DatePicker from "react-native-date-picker";
import { formatDateToDDMMYY } from "../components/FormatedDate";
import { generateExcelZipAndShare } from "../components/GenerateExcelFile";

const HomeScreen = () => {
    const addQtyBottomSheetRef = useRef(null);
    const calcuatorBottomSheetRef = useRef(null);
    const [qtys, setQtys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectedQty, setSelectedQty] = useState(1);
    const [multiplyedBy, setMultiplyedBy] = useState(1);
    const [newTotalQty, setNewTotalQty] = useState(0);

    useEffect(() => {
        const unsubscribe = getQtysRealtime(setQtys, formatDateToDDMMYY(date));
        return () => unsubscribe();
    }, [date]);

    const handleAddQty = async () => {
        setLoading(true);
        try {
            await addQty(selectedQty, formatDateToDDMMYY(date));
            setSelectedQty(1);
            addQtyBottomSheetRef.current?.hide();
            setLoading(false);
        } catch (error) {
            console.log('Failed to add qty', error);
        }
    };

    const handleDeleteQty = async (qtyId) => {
        try {
            await deleteQty(qtyId);
        } catch (error) {
            console.error('Failed to delete qty:', error);
        }
    };

    const handleDatePicker = () => {
        setOpenDatePicker(true);
    }

    const handleIncreasing = () => {
        setSelectedQty(prev => prev + 0.5);
    }

    const handleDecreasing = () => {
        if (selectedQty > 0.5) {
            setSelectedQty(prev => prev - 0.5);
        }
    }

    const handleCalulator = () => {
        calcuatorBottomSheetRef.current?.show();
    }

    const handleModalCloseButton = () => {
        calcuatorBottomSheetRef.current?.hide();
        setMultiplyedBy(1);
        setNewTotalQty(0);
    }

    const handleExport = () => {
        // let sample_data_to_export = [{ id: '1', name: 'Deepak Singh' }, { id: '2', name: 'Nikhil Rattan' }];
        generateExcelZipAndShare(qtys, totalQty);
        calcuatorBottomSheetRef.current?.hide();
        setMultiplyedBy(1);
        setNewTotalQty(0);
    }

    const totalQty = qtys.reduce((total, item) => total + parseFloat(item.qty), 0);

    if (loading) return <View style={[styles.container, { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}><ActivityIndicator /></View>

    return (
        <SafeAreaView style={styles.container}>
            <Header title={'Home'} isButton={false} />
            <TouchableOpacity style={[styles.calender, { right: 100 }]} onPress={handleCalulator}>
                <Image source={IMAGES.calcuator} style={styles.calendarIcon} />
                <Text style={{ fontSize: 12, color: '#ccc' }}>{'Calculate'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calender} onPress={handleDatePicker}>
                <Image source={IMAGES.calender} style={styles.calendarIcon} />
                <Text style={{ fontSize: 12, color: '#ccc' }}>{formatDateToDDMMYY(date)}</Text>
            </TouchableOpacity>
            <ActionSheet
                id='calculator_bottomSheet'
                ref={calcuatorBottomSheetRef}
                containerStyle={styles.bottomSheet}
                onClose={() => {
                    calcuatorBottomSheetRef.current?.hide();
                    setMultiplyedBy(1);
                    setNewTotalQty(0);
                }}
            >
                <Text style={[styles.addQtyText, { color: '#000000', fontSize: 20, alignSelf: 'center' }]}>Calculator</Text>
                <TouchableOpacity onPress={handleExport} style={[styles.addQtyTextButton, { alignSelf: 'flex-end', backgroundColor: null, paddingHorizontal: 10, marginTop: 0, position: 'absolute', top: 0 }]}>
                    <Image source={IMAGES.export} style={[styles.calender, { top: 0, height: 26, width: 26, tintColor: '#9f9f9f9f' }]} />
                </TouchableOpacity>
                <View style={[styles.itemView, { borderBottomWidth: 0, justifyContent: 'center', marginVertical: 30 }]}>
                    <Text style={[styles.addQtyText, { color: '#000000', marginHorizontal: 0, fontSize: 18 }]}>{`Total qty: ${totalQty} x `}</Text>
                    <TextInput
                        value={multiplyedBy}
                        placeholder="Multiply by"
                        onChangeText={setMultiplyedBy}
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={3}
                    />
                    <Text style={[styles.addQtyText, { alignSelf: 'center', color: '#000000', fontSize: 20, }]}>{`= ${newTotalQty}`}</Text>
                </View>
                <TouchableOpacity onPress={() => setNewTotalQty(!multiplyedBy ? totalQty : totalQty * multiplyedBy)} style={[styles.addQtyTextButton, { marginTop: 0 }]}>
                    <Text style={[styles.addQtyText, { marginVertical: 10, alignSelf: 'center', }]}>{'Calculate'}</Text>
                </TouchableOpacity>
            </ActionSheet>
            <DatePicker
                modal
                mode="date"
                open={openDatePicker}
                date={date}
                onConfirm={(date) => {
                    setOpenDatePicker(false)
                    setDate(date)
                }}
                onCancel={() => {
                    setOpenDatePicker(false)
                }}
            />
            <View style={[styles.container, { margin: 20, marginTop: Platform.OS === 'android' ? 90 : 60 }]}>
                {qtys.length > 0 ? (<FlatList
                    data={qtys}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.itemView}>
                                <Text style={styles.qtyItemText}>{`qty: ${item.qty}`}</Text>
                                <Text style={styles.qtyItemText}>{item.date}</Text>
                            </View>
                        )
                    }}
                />)
                    : (<Text style={[styles.qtyItemText, { alignSelf: 'center' }]}>Add first qty</Text>)}
                <TouchableOpacity onPress={() => addQtyBottomSheetRef.current?.show()} style={styles.addQtyIconButton}>
                    <Image source={require('../assets/add.png')} />
                </TouchableOpacity>
                <ActionSheet
                    id='addQty_bottomSheet'
                    ref={addQtyBottomSheetRef}
                    containerStyle={styles.bottomSheet}>
                    <Text style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center', fontWeight: 'bold' }]}>Add Details</Text>
                    <View style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center' }]}>
                        <Text onPress={handleDecreasing} style={[styles.qtyItemText, { fontSize: 50, backgroundColor: '#9f9f9f9f', padding: 10, lineHeight: 20 }]}>-</Text>
                        <Text style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center', marginHorizontal: 30 }]}>{selectedQty}</Text>
                        <Text onPress={handleIncreasing} style={[styles.qtyItemText, { fontSize: 30, backgroundColor: '#9f9f9f9f', padding: 10, lineHeight: 20 }]}>+</Text>
                    </View>
                    <TouchableOpacity style={styles.addQtyTextButton} onPress={handleAddQty}>
                        <Text style={[styles.addQtyText, { marginVertical: 10 }]}>Add qty</Text>
                    </TouchableOpacity>
                </ActionSheet>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
    },
    itemView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    qtyItemText: {
        fontSize: 18,
    },
    addQtyTextButton: {
        alignSelf: 'center',
        backgroundColor: '#154165',
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 20
    },
    addQtyIconButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    addQtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginHorizontal: 10,
    },
    bottomSheet: {
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: '30%',
        position: 'absolute',
        zIndex: 1000,
        padding: 10,
        paddingVertical: 20
    },
    calendarIcon: {
        height: 20,
        width: 20,
        tintColor: '#ccc'
    },
    calender: {
        position: 'absolute',
        right: 20,
        top: Platform.OS === 'android' ? 50 : 20,
        zIndex: 10000,
        alignItems: 'center'
    },
    modalView: {
        backgroundColor: '#ffffff',
        width: '80%',
        height: '40%',
        borderRadius: 20,
        padding: 20,
        alignSelf: 'center',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
    }
});