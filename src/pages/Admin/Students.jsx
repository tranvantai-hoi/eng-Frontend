import { useEffect, useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx'; // Yêu cầu: npm install xlsx
import { 
  Search, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Save, 
  X,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';

// Import API services
import { getAdminStudents, updateStudentFullInfo, importStudents, deleteStudent } from '../../services/api.js';

const Students = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Số lượng hiển thị trên 1 trang

  // --- STATE IMPORT EXCEL (MỚI) ---
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Ref cho input file upload
  const fileInputRef = useRef(null);

  // --- HELPER: FORMAT DATE ---
  const formatDateDisplay = (isoString) => {
    if (!isoString) return '---';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return isoString;
    }
  };

  const formatDateInput = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
    } catch {
      return '';
    }
  };

  // --- FETCH DATA ---
  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminStudents();
      const data = Array.isArray(response) ? response : (response.data || []);
      setStudents(data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      setError(err.message || 'Không thể tải danh sách sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- SEARCH & FILTER ---
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        (student.fullName || '').toLowerCase().includes(searchStr) ||
        (student.mssv || '').toLowerCase().includes(searchStr) ||
        (student.email || '').toLowerCase().includes(searchStr) ||
        (student.faculty || student.className || '').toLowerCase().includes(searchStr)
      );
    });
  }, [students, searchTerm]);

  // --- PAGINATION LOGIC ---
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- HANDLERS: EXCEL (UPDATED FOR LARGE FILES) ---

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const dataToExport = filteredStudents.map(student => ({
      'MSSV': student.mssv,
      'Họ và tên': student.fullName,
      'Ngày sinh': formatDateDisplay(student.dob),
      'Giới tính': student.gender,
      'Lớp/Khoa': student.faculty || student.className,
      'Email': student.email,
      'Số điện thoại': student.phone
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{wch: 15}, {wch: 25}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 30}, {wch: 15}];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSinhVien");

    XLSX.writeFile(workbook, "Danh_Sach_Sinh_Vien.xlsx");
  };

  const handleImportExcelClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // --- LOGIC NHẬP EXCEL ĐÃ TỐI ƯU (BATCHING) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                alert("File Excel rỗng!");
                return;
            }

            // Mapping dữ liệu
            const mappedData = jsonData.map(row => ({
                mssv: row['MSSV'] || row['mssv'],
                fullName: row['Họ và tên'] || row['HoTen'] || row['Họ tên'],
                dob: row['Ngày sinh'] || row['NgaySinh'], 
                gender: row['Giới tính'] || row['GioiTinh'],
                faculty: row['Lớp/Khoa'] || row['Lớp'] || row['Lop'],
                email: row['Email'] || row['email'],
                phone: row['Số điện thoại'] || row['SDT'] || row['dienthoai']
            })).filter(item => item.mssv); // Lọc bỏ dòng không có MSSV

            if (mappedData.length === 0) {
                alert("Không tìm thấy dữ liệu hợp lệ (Thiếu cột MSSV).");
                return;
            }

            if(!window.confirm(`Tìm thấy ${mappedData.length} sinh viên hợp lệ. Bạn có muốn nhập vào hệ thống?`)) {
                e.target.value = null;
                return;
            }

            // --- BẮT ĐẦU XỬ LÝ THEO LÔ (BATCHING) ---
            setIsImporting(true);
            setImportProgress(0);
            
            // Cấu hình kích thước lô (Batch Size)
            // 200 là con số an toàn để không bị timeout hoặc lỗi payload too large
            const BATCH_SIZE = 200; 
            const totalBatches = Math.ceil(mappedData.length / BATCH_SIZE);
            let successCount = 0;
            let errorBatches = [];

            for (let i = 0; i < totalBatches; i++) {
                const start = i * BATCH_SIZE;
                const end = start + BATCH_SIZE;
                const chunk = mappedData.slice(start, end);

                try {
                    // Gọi API import cho từng phần nhỏ
                    await importStudents(chunk);
                    successCount += chunk.length;
                } catch (err) {
                    console.error(`Lỗi import lô ${i + 1}:`, err);
                    errorBatches.push(i + 1);
                }

                // Cập nhật thanh tiến trình
                const currentProgress = Math.round(((i + 1) / totalBatches) * 100);
                setImportProgress(currentProgress);
            }

            // Kết thúc
            setIsImporting(false);
            e.target.value = null; // Reset file input

            let msg = `Đã xử lý xong!\n- Thành công: ${successCount}/${mappedData.length} bản ghi.`;
            if (errorBatches.length > 0) {
                msg += `\n- Có lỗi tại các lô: ${errorBatches.join(', ')} (Vui lòng kiểm tra lại dữ liệu các dòng này).`;
            }
            alert(msg);
            fetchStudents(); // Tải lại danh sách mới nhất

        } catch (error) {
            console.error("Lỗi đọc file Excel:", error);
            alert("Lỗi nghiêm trọng khi đọc file. Vui lòng thử lại.");
            setIsImporting(false);
        }
    };
    reader.readAsBinaryString(file);
  };

  // --- HANDLERS: EDIT/DELETE ---
  const handleEditClick = (student) => {
    setEditingStudent({
      mssv: student.mssv,
      fullName: student.fullName,
      dob: student.dob,
      gender: student.gender,
      faculty: student.faculty || student.className,
      email: student.email,
      phone: student.phone
    });
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    try {
      await updateStudentFullInfo(editingStudent);
      alert('Cập nhật thông tin sinh viên thành công!');
      setIsEditModalOpen(false);
      fetchStudents(); 
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert('Lỗi cập nhật: ' + (err.message || 'Có lỗi xảy ra'));
    }
  };

  const handleDeleteClick = async (mssv) => {
    if (window.confirm(`CẢNH BÁO: Bạn có chắc muốn xóa sinh viên ${mssv} vĩnh viễn?`)) {
      try {
        await deleteStudent(mssv);
        // Cập nhật state trực tiếp để UI phản hồi nhanh
        setStudents(prev => prev.filter(s => s.mssv !== mssv));
        alert(`Đã xóa sinh viên ${mssv} thành công.`);
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        alert("Xóa thất bại: " + (err.message || "Lỗi server"));
      }
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-orange-50/30 p-6 font-sans text-slate-800">
      
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Danh Sách Sinh Viên</h1>
          <p className="mt-1 text-slate-500">Quản lý và chỉnh sửa hồ sơ sinh viên toàn trường.</p>
        </div>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls" 
                className="hidden" 
                disabled={isImporting} // Disable khi đang nhập
            />
            <button 
                onClick={handleImportExcelClick}
                disabled={isImporting}
                className={`inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all ${isImporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-blue-600'}`}
            >
                {isImporting ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} className="text-blue-500" />} 
                {isImporting ? 'Đang nhập...' : 'Nhập Excel'}
            </button>
            <button 
                onClick={handleExportExcel}
                disabled={isImporting}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-green-600 transition-all"
            >
                <Download size={16} className="text-green-600" /> Xuất Excel
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-100/50 animate-fade-in-up flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="flex flex-col border-b border-orange-50 p-5 md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên, MSSV, lớp..."
              className="block w-full rounded-xl border-0 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-orange-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
            Tổng: <span className="font-bold text-orange-600">{filteredStudents.length}</span> kết quả
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto flex-grow">
          {loading && !isImporting ? (
            <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div></div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-red-500">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-sm underline text-blue-600">Thử lại</button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-orange-50">
              <thead className="bg-orange-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Sinh viên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Thông tin cá nhân</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Lớp / Khoa</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Liên hệ</th>
                  <th className="px-6 py-4"><span className="sr-only">Hành động</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 bg-white">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, index) => (
                    <tr key={student.mssv || index} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                         {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900">{student.fullName}</div>
                            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{student.mssv}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 space-y-1">
                          <div className="flex items-center gap-2"><CalendarDays size={14} className="text-slate-400"/> {formatDateDisplay(student.dob)}</div>
                          <div className="flex items-center gap-2"><User size={14} className="text-slate-400"/> {student.gender || '---'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                          {student.faculty || student.className || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 space-y-1">
                          <div className="flex items-center"><Mail size={14} className="mr-2 text-slate-400"/> {student.email || '---'}</div>
                          <div className="flex items-center"><Phone size={14} className="mr-2 text-slate-400"/> {student.phone || '---'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(student)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteClick(student.mssv)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">
                      Không tìm thấy sinh viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && !error && filteredStudents.length > 0 && (
          <div className="border-t border-orange-50 px-6 py-4 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
             <div className="text-sm text-slate-500">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</span> trong tổng số <span className="font-medium">{filteredStudents.length}</span>
             </div>
             
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Trang đầu"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Trang trước"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1 px-2">
                   <span className="text-sm font-semibold text-orange-600">{currentPage}</span>
                   <span className="text-sm text-slate-400">/</span>
                   <span className="text-sm text-slate-600">{totalPages}</span>
                </div>

                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Trang sau"
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Trang cuối"
                >
                  <ChevronsRight size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-zoom-in">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Edit2 size={18}/> Cập nhật hồ sơ sinh viên</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Mã số sinh viên</label>
                 <input type="text" disabled value={editingStudent.mssv} className="w-full rounded-lg bg-slate-100 border-slate-200 text-slate-500 font-mono font-bold cursor-not-allowed" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input name="fullName" type="text" value={editingStudent.fullName} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                <input name="dob" type="date" value={formatDateInput(editingStudent.dob)} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                <select name="gender" value={editingStudent.gender || ''} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500">
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                <input name="faculty" type="text" value={editingStudent.faculty} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>

              <div className="col-span-2 border-t border-dashed border-slate-200 my-1"></div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input name="phone" type="text" value={editingStudent.phone} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" value={editingStudent.email} onChange={handleChange} className="w-full rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500" />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg shadow-orange-200 flex items-center gap-2"><Save size={16}/> Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT PROGRESS MODAL (MỚI THÊM) */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-zoom-in">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đang nhập dữ liệu...</h3>
            <p className="text-sm text-slate-500 mb-6">Vui lòng không đóng trình duyệt.</p>
            
            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-3">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 ease-out"
                 style={{ width: `${importProgress}%` }}
               ></div>
            </div>
            
            <div className="flex justify-between text-xs font-semibold text-slate-600">
               <span>Tiến độ</span>
               <span>{importProgress}%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;