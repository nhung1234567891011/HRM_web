export enum PermissionConstant {
    // Master Permissions
    Admin = 'A',
    Master = 'M',
    Employee = 'E',

    // Human Resources Information

    // Company Information Permissions anh Dũng (r,d)
    ManageCompanyInformation = "MCI",
    ManageCompanyInformationView = "MCI.V",
    ManageCompanyInformationCreate = "MCI.C",
    ManageCompanyInformationEdit = "MCI.E",
    ManageCompanyInformationDelete = "MCI.D",

    // Organizational Structure + Diagram Permissions khoa(c,r, u) A.Dũng(r,de)
    ManageOrganizationalStructure = "MOS",
    ManageOrganizationalStructureView = "MOS.V",
    ManageOrganizationalStructureCreate = "MOS.C",
    ManageOrganizationalStructureEdit = "MOS.E",
    ManageOrganizationalStructureDelete = "MOS.D",

    // Position Permissions
    ManagePosition = 'MP',
    ManagePositionView = 'MP.V',
    ManagePositionCreate = 'MP.C',
    ManagePositionEdit = 'MP.E',
    ManagePositionDelete = 'MP.D',

    // Object Permissions khoa đối tượng
    ManageObject = "MO",
    ManageObjectView = "MO.V",
    ManageObjectCreate = "MO.C",
    ManageObjectEdit = "MO.E",
    ManageObjectDelete = "MO.D",
    ManageObjectSendMail = "MO.SM",
    ManageObjectChangePosition = "MO.CP",

    // Profile Permissions
    ManageProfile = 'MPR',
    ManageProfileView = 'MPR.V',
    ManageProfileCreate = 'MPR.C',
    ManageProfileEdit = 'MPR.E',
    ManageProfileDelete = 'MPR.D',

    // Contract Permissions
    ManageContract = 'MC',
    ManageContractView = 'MC.V',
    ManageContractCreate = 'MC.C',
    ManageContractEdit = 'MC.E',
    ManageContractDelete = 'MC.D',
    ManageContractExport = 'MC.EX',
    ManageContractTerminate = 'MC.T', // Quyền chấm dứt hợp đồng
    // Timekeeping

    // Timekeeping Location Permissions
    // Quyền quản lý thông tin địa điểm chấm công
    ManageTimekeepingLocation = "MTL",
    // Quyền xem thông tin địa điểm chấm công
    ManageTimekeepingLocationView = "MTL.V",
    // Quyền tạo mới thông tin địa điểm chấm công
    ManageTimekeepingLocationCreate = "MTL.C",
    // Quyền chỉnh sửa thông tin địa điểm chấm công
    ManageTimekeepingLocationEdit = "MTL.E",
    // Quyền xóa thông tin địa điểm chấm công
    ManageTimekeepingLocationDelete = "MTL.D",

    // Unit Application Permissions
    // Quyền quản lý thông tin đơn vị áp dụng
    ManageUnitApplication = "MUA",
    // Quyền xem thông tin đơn vị áp dụng
    ManageUnitApplicationView = "MUA.V",
    // Quyền tạo mới thông tin đơn vị áp dụng
    ManageUnitApplicationCreate = "MUA.C",
    // Quyền chỉnh sửa thông tin đơn vị áp dụng
    ManageUnitApplicationEdit = "MUA.E",
    // Quyền xóa thông tin đơn vị áp dụng
    ManageUnitApplicationDelete = "MUA.D",


    // Timekeeping Rules Permissions
    ManageTimekeepingRules = 'MTR',
    ManageTimekeepingRulesView = 'MTR.V',
    ManageTimekeepingRulesCreate = 'MTR.C',
    ManageTimekeepingRulesEdit = 'MTR.E',
    ManageTimekeepingRulesDelete = 'MTR.D',

    // Leave Regulations Permissions
    ManageLeaveRegulations = 'MLR',
    ManageLeaveRegulationsView = 'MLR.V',
    ManageLeaveRegulationsCreate = 'MLR.C',
    ManageLeaveRegulationsEdit = 'MLR.E',
    ManageLeaveRegulationsDelete = 'MLR.D',

    //THiện
    // Shift Setup Permissions
    ManageShiftSetup = 'MSS',
    ManageShiftSetupView = 'MSS.V',
    ManageShiftSetupCreate = 'MSS.C',
    ManageShiftSetupEdit = 'MSS.E',
    ManageShiftSetupDelete = 'MSS.D',

    //Thiện
    //Phan ca
    // Shift Allocation Permissions
    ManageShiftAllocation = 'MSA',
    ManageShiftAllocationView = 'MSA.V',
    ManageShiftAllocationCreate = 'MSA.C',
    ManageShiftAllocationEdit = 'MSA.E',
    ManageShiftAllocationDelete = 'MSA.D',

    // Detailed Timekeeping Permissions
    ManageDetailedTimekeeping = 'MDT',
    ManageDetailedTimekeepingView = 'MDT.V',
    ManageDetailedTimekeepingCreate = 'MDT.C',
    ManageDetailedTimekeepingEdit = 'MDT.E',
    ManageDetailedTimekeepingDelete = 'MDT.D',
    ManageDetailedTimekeepingLock = 'MDT.L',

    // General Timekeeping Permissions
    ManageGeneralTimekeeping = 'MGT',
    ManageGeneralTimekeepingView = 'MGT.V',
    ManageGeneralTimekeepingCreate = 'MGT.C',
    ManageGeneralTimekeepingEdit = 'MGT.E',
    ManageGeneralTimekeepingDelete = 'MGT.D',
    ManageGeneralTimekeepingTransferSalary = 'MGT.TS',
    ManageGeneralTimekeepingSendConfirmation = 'MGT.SC',
    ManageGeneralTimekeepingFeedback = 'MGT.FB',



    // Leave Regulations Permissions
    // Quyền quản lý thông tin quy định nghỉ - loại nghỉ
    ManageLeaveTypes = "MLT",
    // Quyền xem thông tin quy định nghỉ - loại nghỉ
    ManageLeaveTypesView = "MLT.V",
    // Quyền tạo mới thông tin quy định nghỉ - loại nghỉ
    ManageLeaveTypesCreate = "MLT.C",
    // Quyền chỉnh sửa thông tin quy định nghỉ - loại nghỉ
    ManageLeaveTypesEdit = "MLT.E",
    // Quyền xóa thông tin quy định nghỉ - loại nghỉ
    ManageLeaveTypesDelete = "MLT.D",


    // Public Holiday Permissions
    // Quyền quản lý thông tin quy định nghỉ lễ
    ManagePublicHolidays = "MPH",
    // Quyền xem thông tin quy định nghỉ lễ
    ManagePublicHolidaysView = "MPH.V",
    // Quyền tạo mới thông tin quy định nghỉ lễ
    ManagePublicHolidaysCreate = "MPH.C",
    // Quyền chỉnh sửa thông tin quy định nghỉ lễ
    ManagePublicHolidaysEdit = "MPH.E",
    // Quyền xóa thông tin quy định nghỉ lễ
    ManagePublicHolidaysDelete = "MPH.D",


    // Payroll

    // Salary Components Permissions khoa
    ManageSalaryComponents = "MSC",
    ManageSalaryComponentsView = "MSC.V",
    ManageSalaryComponentsCreate = "MSC.C",
    ManageSalaryComponentsEdit = "MSC.E",
    ManageSalaryComponentsDelete = "MSC.D",

    // KPI Permissions
    ManageKPI = 'MKPI',
    ManageKPIView = 'MKPI.V',
    ManageKPICreate = 'MKPI.C',
    ManageKPIEdit = 'MKPI.E',
    ManageKPIDelete = 'MKPI.D',

    //Thiện
    // Payroll Table Permissions
    ManagePayrollTable = 'MPT',
    ManagePayrollTableView = 'MPT.V',
    ManagePayrollTableCreate = 'MPT.C',
    ManagePayrollTableEdit = 'MPT.E',
    ManagePayrollTableDelete = 'MPT.D',
    ManagePayrollTableSend = 'MPT.S',
    ManagePayrollTableFeedback = 'MPT.FB',

    //Bảng lương
    ManageTimeSheep = 'MTS',

    ManagePro = 'MPRO',

    // Statistical Report Permissions
    ManageStatisticalReport = 'MSR',
    ManageStatisticalReportView = 'MSR.V',
}
