export const formatDateToDDMMYY = (inputDate) => {
    let date;

    // Handle Firestore Timestamp (with toDate method)
    if (inputDate?.toDate) {
        date = inputDate.toDate();
    } else {
        date = new Date(inputDate);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}-${month}-${year}`;
};