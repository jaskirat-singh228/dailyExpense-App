import ExcelJS from 'exceljs';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { zip } from 'react-native-zip-archive';
import { Buffer } from 'buffer';

export const generateExcelZipAndShare = async (data, totalQty) => {
    try {
        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('QtysExcelSheet');

        // Define columns
        worksheet.columns = [
            { header: 'Id', key: 'id', width: 32 },
            { header: 'Qty', key: 'qty', width: 10 },
            { header: 'Date', key: 'date', width: 15 },
        ];

        // Apply styling to header (if needed)
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCE5FF' },
        };

        // Add rows
        data.forEach(item => worksheet.addRow(item));

        // Add blank row
        worksheet.addRow([]);

        // Add total row with styling
        const totalRow = worksheet.addRow(['Total =', totalQty, '']);
        totalRow.font = { bold: true };

        // Apply alignment to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                if (rowNumber === 1) {
                    cell.font = { bold: true };
                }
            });
        });

        //  Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = 'QtysExcelSheet.xlsx';
        const zipName = 'QtysExcelSheet.zip';
        const excelPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        const zipPath = `${RNFS.DocumentDirectoryPath}/${zipName}`;

        // Save Excel file
        await RNFS.writeFile(excelPath, Buffer.from(buffer).toString('base64'), 'base64');
        console.log('Styled Excel saved at:', excelPath);

        // Create ZIP
        const zipResult = await zip(excelPath, zipPath);
        console.log('ZIP created at:', zipResult);

        // Share
        await Share.open({
            title: 'Share ZIP File',
            url: `file://${zipResult}`,
            type: 'application/zip',
            failOnCancel: false,
        });

    } catch (error) {
        console.error('Error in generateStyledExcelZipAndShare:', error.message || error);
    }
};

