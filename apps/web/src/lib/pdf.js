import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate a professional IAYO membership certificate PDF (A4 landscape)
 * with a QR code linking to the public verification page.
 *
 * @param {Object} opts
 * @param {string} opts.name
 * @param {string} opts.membershipCode
 * @param {string} opts.district
 * @param {string} opts.town
 * @param {string} opts.registered  ISO date string
 * @param {string} opts.verifyUrl   full public verification URL
 * @returns {Promise<jsPDF>}
 */
export async function buildMembershipCertificate({
    name,
    membershipCode,
    district,
    town,
    registered,
    verifyUrl,
}) {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl || membershipCode, {
        margin: 1,
        width: 320,
        color: { dark: '#0B1B33', light: '#FFFFFF' },
    });

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Navy border frame
    doc.setDrawColor('#0B1B33');
    doc.setLineWidth(3);
    doc.rect(24, 24, pageW - 48, pageH - 48);
    doc.setLineWidth(0.75);
    doc.setDrawColor('#1D4ED8');
    doc.rect(34, 34, pageW - 68, pageH - 68);

    // Header mark
    doc.setFillColor('#1D4ED8');
    doc.rect(54, 54, 34, 34, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('I', 71, 77, { align: 'center' });

    doc.setTextColor('#0B1B33');
    doc.setFontSize(13);
    doc.text('IAYO', 98, 66);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#5B6B82');
    doc.text('INDIAN ALLIED YOUTHS PARTY', 98, 78);

    // Orange accent rule
    doc.setDrawColor('#E2552A');
    doc.setLineWidth(2);
    doc.line(54, 104, pageW - 54, 104);

    // Title
    doc.setTextColor('#0B1B33');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('MEMBERSHIP CERTIFICATE', pageW / 2, 150, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#5B6B82');
    doc.text(
        'This is to certify that the bearer is a registered member of the Indian Allied Youths Party.',
        pageW / 2,
        172,
        { align: 'center' },
    );

    // Member name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor('#1D4ED8');
    doc.text(name || '—', pageW / 2, 222, { align: 'center' });

    // Detail grid
    const leftCol = 90;
    const rightCol = pageW / 2 + 40;
    const rowY = 280;
    const rowGap = 30;

    function field(x, y, label, value) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor('#5B6B82');
        doc.text(label.toUpperCase(), x, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor('#0B1B33');
        doc.text(value || '—', x, y + 16);
    }

    field(leftCol, rowY, 'Membership ID', membershipCode);
    field(rightCol, rowY, 'Date of Registration', formatDatePdf(registered));
    field(leftCol, rowY + rowGap * 2, 'District', district);
    field(rightCol, rowY + rowGap * 2, 'Village / Town / City', town);

    // QR code (bottom-left)
    doc.addImage(qrDataUrl, 'PNG', 70, pageH - 150, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor('#5B6B82');
    doc.text('Scan to verify', 115, pageH - 52, { align: 'center' });

    // Verification URL
    doc.setFontSize(8);
    doc.setTextColor('#1D4ED8');
    doc.text(verifyUrl || '', pageW - 54, pageH - 70, { align: 'right' });

    // Disclaimer
    doc.setDrawColor('#D7DDE8');
    doc.setLineWidth(0.5);
    doc.line(190, pageH - 90, pageW - 54, pageH - 90);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor('#5B6B82');
    doc.text(
        'This certificate confirms registration as an IAYO member/participant only. It does not constitute',
        190,
        pageH - 74,
    );
    doc.text(
        'government identification and confers no official status. Verify at the URL or QR code above.',
        190,
        pageH - 62,
    );

    // Signature line
    doc.setDrawColor('#0B1B33');
    doc.setLineWidth(0.75);
    doc.line(pageW - 200, pageH - 110, pageW - 70, pageH - 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#5B6B82');
    doc.text('Authorised by, IAYO Central Secretariat', pageW - 135, pageH - 96, {
        align: 'center',
    });

    return doc;
}

function formatDatePdf(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function downloadMembershipCertificate(opts) {
    return buildMembershipCertificate(opts).then((doc) => {
        doc.save(`IAYO-Membership-${opts.membershipCode || 'certificate'}.pdf`);
    });
}
