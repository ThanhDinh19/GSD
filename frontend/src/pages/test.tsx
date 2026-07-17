// {operationActionPopup && (
//                 <div className="fixed inset-0 z-500 bg-slate-900/40 flex items-center justify-center p-6">
//                     <div className="w-[1000px] max-w-[94vw] max-h-[88vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
//                         <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
//                             <div>
//                                 <h2 className="text-lg text-slate-800">
//                                     Danh sách thao tác công đoạn
//                                 </h2>

//                                 <div className="text-sm text-slate-500 mt-1">
//                                     {operationActionPopup.operationCode || '-'} -{' '}
//                                     <span className="text-slate-700">
//                                         {operationActionPopup.operationName}
//                                     </span>
//                                 </div>
//                             </div>

//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setOperationActionPopup(null);
//                                     setOperationActions([]);
//                                 }}
//                                 className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
//                             >
//                                 ✕
//                             </button>
//                         </div>

//                         <div className="flex-1 min-h-0 overflow-auto">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-slate-50 sticky top-0 z-10">
//                                     <tr className="text-xs text-slate-500 uppercase">
//                                         <th className="p-3 border-b border-slate-200 text-center w-[80px]">
//                                             Bước
//                                         </th>
//                                         <th className="p-3 border-b border-slate-200 text-left w-[120px]">
//                                             Code
//                                         </th>
//                                         <th className="p-3 border-b border-slate-200 text-left">
//                                             Thao tác
//                                         </th>
//                                         <th className="p-3 border-b border-slate-200 text-right w-[100px]">
//                                             TMU
//                                         </th>
//                                         <th className="p-3 border-b border-slate-200 text-right w-[100px]">
//                                             Tần suất
//                                         </th>
//                                         <th className="p-3 border-b border-slate-200 text-right w-[100px]">
//                                             Giây
//                                         </th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {loadingOperationActions && (
//                                         <tr>
//                                             <td colSpan={6} className="p-10 text-center text-slate-400">
//                                                 Đang tải danh sách thao tác...
//                                             </td>
//                                         </tr>
//                                     )}

//                                     {!loadingOperationActions && operationActions.length === 0 && (
//                                         <tr>
//                                             <td colSpan={6} className="p-10 text-center text-slate-400">
//                                                 Công đoạn này chưa có thao tác.
//                                             </td>
//                                         </tr>
//                                     )}

//                                     {!loadingOperationActions &&
//                                         operationActions.map((action) => (
//                                             <tr
//                                                 key={action.id}
//                                                 className="border-b border-slate-100 hover:bg-slate-50"
//                                             >
//                                                 <td className="p-3 text-center font-bold text-slate-600">
//                                                     {action.step_no ?? action.line_no}
//                                                 </td>

//                                                 <td className="p-3 font-bold text-blue-700">
//                                                     {action.gsd_code || '-'}
//                                                 </td>

//                                                 <td className="p-3 text-slate-700">
//                                                     {action.action_name}
//                                                 </td>

//                                                 <td className="p-3 text-right">
//                                                     {toNumber(action.tmu).toFixed(2)}
//                                                 </td>

//                                                 <td className="p-3 text-right">
//                                                     {toNumber(action.frequency).toFixed(2)}
//                                                 </td>

//                                                 <td className="p-3 text-right font-bold text-slate-800">
//                                                     {toNumber(action.seconds).toFixed(2)}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setOperationActionPopup(null);
//                                     setOperationActions([]);
//                                 }}
//                                 className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
//                             >
//                                 Đóng
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}