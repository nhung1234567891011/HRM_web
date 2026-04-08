// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// production ##########################################33
// export const environment = {
//     production: false,
//     hubUrl: 'https://apihrm.smomedia.vn:1000/hubs',
//     // baseFeUrl: 'http://localhost:4200',
//     baseFeUrl: 'https://hrm.smomedia.vn',
//     baseApiUrl: 'https://apihrm.smomedia.vn:1000/api',
//     baseApiImageUrl: 'https://apihrm.smomedia.vn:1000',
//     baseSignLRUrl: 'https://apihrm.smomedia.vn:1000',
//     baseApiUploadFile: 'https://apihrm.smomedia.vn:1000/api/file/upload',
//     baseApiDeleteFile: 'https://apihrm.smomedia.vn:1000/api/file/delete',
// };

export const environment = {
    production: false,
    // baseFeUrl: 'https://hrm.smomedia.vn',
    baseFeUrl: 'http://localhost:4200',
    baseApiUrl: 'https://localhost:7115/api',
    baseApiImageUrl: 'https://localhost:7115',
    baseSignLRUrl: 'https://localhost:7115',
    baseApiUploadFile: 'https://localhost:7115/api/file/upload',
    baseApiDeleteFile: 'https://localhost:7115/api/file/delete',
};

// môi trường phát triển UAT ================================
// export const environment = {
//     production: false,
//     baseFeUrl: 'http://103.153.69.217:7009',
//     // baseFeUrl: 'http://localhost:4200',
//     baseApiUrl: 'http://103.153.69.217:7010/api',
//     baseApiImageUrl: 'http://103.153.69.217:7010',
//     baseSignLRUrl: 'http://103.153.69.217:7010',
//     baseApiUploadFile: 'http://103.153.69.217:7010/api/file/upload',
//     baseApiDeleteFile: 'http://103.153.69.217:7010/api/file/delete',
// };
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
