import Settings from '@/assets/icon/pro_2.png';
import Camera from '@/assets/icon/ins.png';
import Tnt from '@/assets/icon/key_2.png';
import User from '@/assets/icon/user.png';
import moveIn from '@/assets/icon/moveIn.png';
import moveOut from '@/assets/icon/moveOut.png';
import Report from '@/assets/icon/reports.png';
import hourGlass from '@/assets/icon/hourglass.png';

const HomeProps = [
    { title: 'Add Property', route: 'AddPropertyScreen', icon: Settings, carry: null },
    { title: 'Add Inspection', route: null, icon: Camera, carry: null, subRoutes: [
        { title: 'Move In', route: 'InspectionDetails', icon: moveIn, carry: { id: null, type: 'MOVE_IN' } },
        { title: 'Move Out', route: 'InspectionDetails', icon: moveOut, carry: { id: null, type: 'MOVE_OUT' } },
        { title: 'Periodic Inspection', route: 'InspectionDetails', icon: hourGlass, carry: { id: null, type: 'Periodic Inspection' } },
        { title: 'General Inspection', route: 'InspectionDetails', icon: User, carry: { id: null, type: 'Periodic Inspection' } },
    ] },
    { title: 'Create Renter', route: 'CreateTenant', icon: Tnt, carry: null },
    { title: 'Run Report', route: 'ReportsTab', icon: Report, carry: null },
];



export { HomeProps };
