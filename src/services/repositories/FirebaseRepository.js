import firestore from '@react-native-firebase/firestore';
import { formatDateToDDMMYY } from '../../components/FormatedDate';

const qtysCollection = firestore().collection('qtys');

export const getQtysRealtime = (filteredQtys, filterDate = formatDateToDDMMYY(new Date())) => {
    const query = qtysCollection.orderBy('date', 'asc');

    const unsubscribe = query.onSnapshot(snapshot => {
        const qtyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const [filterDay, filterMonth, filterYear] = filterDate.split('-');
        const fMonth = parseInt(filterMonth);
        const fYear = parseInt(filterYear);

        const filteredQty = qtyList.filter(qty => {
            const [qtyDay, qtyMonth, qtyYear] = qty.date.split('-');
            const qMonth = parseInt(qtyMonth);
            const qYear = parseInt(qtyYear);

            return qMonth === fMonth && qYear === fYear;
        });

        filteredQtys(filteredQty);
    });

    return unsubscribe;
};


export const addQty = async (qty, date) => {
    try {
        await qtysCollection.add({
            qty,
            date: date,
        });
    } catch (error) {
        console.error('Error adding qty:', error);
        throw error;
    }
};

export const deleteQty = async (qtyId) => {
    try {
        await qtysCollection.doc(qtyId).delete();
    } catch (error) {
        console.error('Error deleting qty:', error);
        throw error;
    }
};
