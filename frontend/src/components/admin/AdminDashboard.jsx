import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tabs, Tab, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Avatar, 
  Chip, Card, CardContent, Grid, Divider, Tooltip, Alert, Snackbar,
  CircularProgress, Skeleton, useMediaQuery, useTheme, Pagination, InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Block as BlockIcon, 
  Visibility as VisibilityIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { FaHourglassHalf, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/adminProductForm.css';


const api = axios.create({
  baseURL: 'http://localhost:1111',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Bỏ header Content-Type khi gửi FormData
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Nếu là FormData, không đặt Content-Type để browser tự xử lý
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Không đặt header Content-Type cho FormData
      // browser sẽ tự động thiết lập với boundary đúng
    }
    
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  responseData => responseData,
  error => {
    console.error('API Error:', error.response || error);
    if (error.response && error.response.status === 401) {
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockUserDialogOpen, setBlockUserDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    stock: '',
    category: '',
    detail: {
      screen: '',
      os: '',
      camera: '',
      cameraFront: '',
      cpu: '',
      battery: ''
    },
    variants: [{
      ram: '',
      rom: '',
      price: ''
    }],
    colors: [{
      colorName: '',
      image: null
    }]
  });

  // Thống kê tổng quan
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });

  // Thêm state cho cập nhật trạng thái và message
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Thêm state cho ID đơn hàng đang chọn
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [users, products, orders]);

  const fetchStats = async () => {
    try {
      // Trong thực tế, bạn sẽ gọi API để lấy thống kê
      // Đây là dữ liệu mẫu
      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        revenue: orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0)
      });
    } catch (err) {
      console.error('Lỗi khi lấy thống kê:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get('/api/admin/orders'),
        api.get('/products/admin'),
        api.get('/api/admin/users')
      ]);

      if (ordersRes.status === 'fulfilled') {
        setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
      }
      
      // Xử lý dữ liệu sản phẩm
      if (productsRes.status === 'fulfilled') {
        setProducts(Array.isArray(productsRes.value.data) ? productsRes.value.data : []);
      }
      
      // Xử lý dữ liệu người dùng
      if (usersRes.status === 'fulfilled') {
        setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
      }
      
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể tải dữ liệu. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    setPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleViewOrderDetails = (order) => {
    console.log("View order details:", order);
    setOrderDetails(order);
    setOrderDialogOpen(true);
  };

  const handleBlockUser = (user) => {
    setSelectedItem(user);
    setBlockUserDialogOpen(true);
  };

  const confirmBlockUser = async () => {
    try {
      await api.put(`/api/admin/${selectedItem.id || selectedItem._id}/block`);
      
      setUsers(users.map(user => 
        (user.id || user._id) === (selectedItem.id || selectedItem._id) 
          ? {...user, enabled: false} 
          : user
      ));
      
      setBlockUserDialogOpen(false);
      showSnackbar('Đã khóa tài khoản người dùng thành công', 'success');
    } catch (err) {
      console.error('Lỗi khóa người dùng:', err);
      showSnackbar('Không thể khóa người dùng. Vui lòng thử lại sau.', 'error');
    }
  };

  const handleDeleteProduct = (product) => {
    setSelectedItem(product);
    setDeleteProductDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedItem(product);
    
    setNewProduct({
      name: product.name,
      description: product.description,
      stock: product.stock.toString(),
      category: product.category,
      detail: {
        screen: product.screen || '',
        os: product.os || '',
        camera: product.camera || '',
        cameraFront: product.cameraFront || '',
        cpu: product.cpu || '',
        battery: product.battery || ''
      },
      variants: product.variants && product.variants.length > 0 
        ? product.variants.map(variant => ({
            ram: variant.ram || '',
            rom: variant.rom || '',
            price: variant.price.toString()
          }))
        : [{ ram: '', rom: '', price: product.price.toString() }],
      colors: product.colors && product.colors.length > 0
        ? product.colors.map(color => ({
            colorName: color.colorName || '',
            image: color.imageUrl || color.image || null  // Đảm bảo lấy đúng đường dẫn ảnh
          }))
        : [{ colorName: '', image: null }]
    });
    
    setEditProductDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await api.delete(`/api/admin/products/${selectedItem.id}`);
      
      setProducts(products.filter(product => product.id !== selectedItem.id));
      
      setDeleteProductDialogOpen(false);
      showSnackbar('Đã xóa sản phẩm thành công', 'success');
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleAddProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      stock: '',
      category: '',
      detail: {
        screen: '',
        os: '',
        camera: '',
        cameraFront: '',
        cpu: '',
        battery: ''
      },
      variants: [{
        ram: '',
        rom: '',
        price: ''
      }],
      colors: [{
        colorName: '',
        image: null
      }]
    });
    setAddProductDialogOpen(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Xử lý các trường lồng nhau (detail, variants, colors)
      const [parent, child] = name.split('.', 2);
      
      if (parent === 'detail') {
        setNewProduct(prev => ({
          ...prev,
          detail: {
            ...prev.detail,
            [child]: value
          }
        }));
      } else if (name.includes('variants[')) {
        // Xử lý variants
        const match = name.match(/variants\[(\d+)\]\.(.+)/);
        if (match) {
          const [_, index, field] = match;
          setNewProduct(prev => {
            const newVariants = [...prev.variants];
            newVariants[parseInt(index)][field] = value;
            return {
              ...prev,
              variants: newVariants
            };
          });
        }
      } else if (name.includes('colors[')) {
        // Xử lý colors
        const match = name.match(/colors\[(\d+)\]\.(.+)/);
        if (match) {
          const [_, index, field] = match;
          setNewProduct(prev => {
            const newColors = [...prev.colors];
            newColors[parseInt(index)][field] = value;
            return {
              ...prev,
              colors: newColors
            };
          });
        }
      }
    } else {
      // Xử lý các trường cơ bản
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Thêm hàm xử lý file upload
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fieldName.includes('colors[')) {
      // Xử lý upload ảnh cho colors
      const match = fieldName.match(/colors\[(\d+)\]\.image/);
      if (match) {
        const index = match[1];
        setNewProduct(prev => {
          const newColors = [...prev.colors];
          newColors[parseInt(index)].image = file;
          return {
            ...prev,
            colors: newColors
          };
        });
      }
    }
  };

  const submitNewProduct = async () => {
    try {
      let hasFiles = false;
      let uploadedImageUrls = [];
      
      // Bước 1: Upload các file ảnh trước 
      for (let index = 0; index < newProduct.colors.length; index++) {
        const color = newProduct.colors[index];
        
        if (color.image instanceof File) {
          hasFiles = true;
          
          // Tạo FormData riêng cho mỗi file để tránh trộn lẫn dữ liệu
          const fileFormData = new FormData();
          fileFormData.append('file', color.image);
          
          try {
            const uploadResponse = await fetch('http://localhost:1111/upload', {
              method: 'POST',
              body: fileFormData,
              headers: {
                'Authorization': localStorage.getItem('accessToken') 
                  ? `Bearer ${localStorage.getItem('accessToken')}` 
                  : ''
              }
            });
          
            if (!uploadResponse.ok) {
              throw new Error('Lỗi khi upload ảnh');
            }
          
            const uploadResult = await uploadResponse.text();
          
            uploadedImageUrls[index] = uploadResult;
          
          } catch (uploadError) {
            throw new Error(`Lỗi tải file: ${uploadError.message}`);
          }
        }
      }
      
      // Đảm bảo có ít nhất một file
      if (!hasFiles) {
        showSnackbar('Vui lòng thêm ít nhất một ảnh cho sản phẩm', 'error');
        return;
      }
      
      // Tạo đối tượng JSON để gửi đi thay vì FormData
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        detail: newProduct.detail,
        variants: newProduct.variants.map(v => ({
          ...v,
          price: parseInt(v.price || 0)
        })),
        colors: newProduct.colors.map((color, index) => ({
          colorName: color.colorName,
          imageUrl: uploadedImageUrls[index] || null
        }))
      };
      
      const response = await fetch('http://localhost:1111/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : ''
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi thêm sản phẩm');
      }
      
      setAddProductDialogOpen(false);
      showSnackbar('Đã thêm sản phẩm mới thành công', 'success');
      fetchAllData();
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      showSnackbar(err.message || 'Không thể thêm sản phẩm. Vui lòng thử lại sau.', 'error');
    }
  };

  const submitEditProduct = async () => {
    try {
      let uploadedImageUrls = {};
      
      // Chỉ xử lý các ảnh mới (File)
      for (let index = 0; index < newProduct.colors.length; index++) {
        const color = newProduct.colors[index];
        
        if (color.image instanceof File) {
          // Tạo FormData riêng cho mỗi file để tránh trộn lẫn dữ liệu
          const fileFormData = new FormData();
          fileFormData.append('file', color.image);
          
          try {
            const uploadResponse = await fetch('http://localhost:1111/upload', {
              method: 'POST',
              body: fileFormData,
              headers: {
                'Authorization': localStorage.getItem('accessToken') 
                  ? `Bearer ${localStorage.getItem('accessToken')}` 
                  : ''
              }
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Lỗi khi upload ảnh');
            }
            
            // Lấy URL từ response
            const uploadResult = await uploadResponse.text();
            uploadedImageUrls[index] = uploadResult;
          } catch (uploadError) {
            console.error('Upload file error:', uploadError);
            throw new Error(`Lỗi tải file: ${uploadError.message}`);
          }
        }
      }
      
      // Xử lý màu sắc để tránh trùng lặp
      // Lọc ra các màu sắc có tên duy nhất
      const uniqueColors = [];
      const colorNames = new Set();
      
      newProduct.colors.forEach((color, index) => {
        // Bỏ qua màu không có tên
        if (!color.colorName.trim()) return;
        
        // Nếu tên màu chưa xuất hiện trong tập hợp, thêm vào
        if (!colorNames.has(color.colorName.trim().toLowerCase())) {
          colorNames.add(color.colorName.trim().toLowerCase());
          
          const colorData = {
            colorName: color.colorName
          };
          
          // Xử lý ảnh cho màu này
          if (uploadedImageUrls[index]) {
            colorData.imageUrl = uploadedImageUrls[index];
          } else if (typeof color.image === 'string') {
            colorData.imageUrl = color.image;
          }
          
          if (colorData.imageUrl) {
            uniqueColors.push(colorData);
          }
        }
      });
      
      // Chuyển đổi dữ liệu sản phẩm sang định dạng JSON
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        detail: {
          screen: newProduct.detail.screen || '',
          os: newProduct.detail.os || '',
          camera: newProduct.detail.camera || '',
          cameraFront: newProduct.detail.cameraFront || '',
          cpu: newProduct.detail.cpu || '',
          battery: newProduct.detail.battery || ''
        },
        variants: newProduct.variants.map(v => ({
          ...v,
          price: parseInt(v.price || 0)
        })),
        colors: uniqueColors
      };
      
      const response = await fetch(`http://localhost:1111/api/admin/products/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : ''
        },
        body: JSON.stringify(productData)
      });
      
      console.log(productData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật sản phẩm');
      }
      
      setProducts(products.map(product => 
        product.id === selectedItem.id 
          ? { 
              ...product, 
              name: newProduct.name,
              description: newProduct.description,
              // Lấy giá từ phiên bản đầu tiên nếu có
              price: newProduct.variants[0]?.price ? parseInt(newProduct.variants[0].price) : product.price,
              stock: parseInt(newProduct.stock),
              category: newProduct.category
            } 
          : product
      ));
      
      setEditProductDialogOpen(false);
      showSnackbar('Đã cập nhật sản phẩm thành công', 'success');
    } catch (err) {
      console.error('Lỗi cập nhật sản phẩm:', err);
      showSnackbar(err.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại sau.', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Lọc và sắp xếp dữ liệu
  const filteredData = useMemo(() => {
    let dataToFilter = [];
    
    if (tabValue === 0) dataToFilter = orders;
    else if (tabValue === 1) dataToFilter = products;
    else if (tabValue === 2) dataToFilter = users;
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      return dataToFilter.filter(item => {
        if (tabValue === 0) { // Orders
  return (
            (item.id || item._id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.user?.name || item.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.status || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else if (tabValue === 1) { // Products
          return (
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else { // Users
          return (
            (item.name || item.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }
    
    return dataToFilter;
  }, [tabValue, orders, products, users, searchTerm]);

  // Sắp xếp dữ liệu
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Xử lý các trường đặc biệt
      if (sortConfig.key === 'user') {
        aValue = a.user?.name || a.fullName || '';
        bValue = b.user?.name || b.fullName || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Phân trang
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Render biểu tượng sắp xếp
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  // Render skeleton loading
  const renderSkeletonTable = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: tabValue === 0 ? 6 : tabValue === 1 ? 6 : 7 }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton animation="wave" height={30} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: tabValue === 0 ? 6 : tabValue === 1 ? 6 : 7 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton animation="wave" height={25} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render thống kê tổng quan
  const renderStats = () => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tổng quan
        </Typography>
        <Grid container spacing={3}>
          <Grid >
            <Card sx={{ bgcolor: '#bbdefb', color: '#0d47a1' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Người dùng
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ bgcolor: '#c8e6c9', color: '#1b5e20' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Sản phẩm
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {stats.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ bgcolor: '#fff9c4', color: '#f57f17' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Đơn hàng
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {stats.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ bgcolor: '#ffccbc', color: '#bf360c' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Doanh thu
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {stats.revenue.toLocaleString('vi-VN')}₫
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Thêm hàm getOrderStatusLabel vào component AdminDashboard
  const getOrderStatusLabel = (status) => {
    if (!status) return "Chưa xác định";
    switch (status) {
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPING":
        return "Đang vận chuyển";
      case "COMPLETED":
        return "Đã giao hàng";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Thêm hàm xử lý mở dialog cập nhật trạng thái
  const handleOpenUpdateStatus = () => {
    if (orderDetails) {
      console.log("Opening update status dialog - Order details:", orderDetails);
      
      // Lưu ID vào state riêng để đảm bảo có giá trị
      setSelectedOrderId(orderDetails.id);
      console.log("Setting selected order ID:", orderDetails.id);
      
      setSelectedItem(orderDetails);
      setNewOrderStatus(orderDetails.orderStatus || 'PROCESSING');
      setStatusMessage('');
      setUpdateStatusDialogOpen(true);
    }
  };

  // Thêm hàm xử lý lưu trạng thái mới
  const handleUpdateOrderStatus = async () => {
    try {
      console.log("===== UPDATE STATUS DEBUGGING =====");
      console.log("Selected item:", selectedItem);
      console.log("Order details:", orderDetails);
      console.log("Selected order ID:", selectedOrderId);
      
      // Sử dụng orderDetails nếu selectedItem là null
      const orderToUpdate = selectedItem || orderDetails;
      
      if (!orderToUpdate) {
        console.error("ERROR: Không tìm thấy thông tin đơn hàng");
        showSnackbar('Không tìm thấy đơn hàng', 'error');
        return;
      }
      
      if (!newOrderStatus) {
        console.error("ERROR: newOrderStatus is empty");
        showSnackbar('Vui lòng chọn trạng thái', 'error');
        return;
      }
      
      // Lưu giá trị trước khi đóng dialog để tránh bị reset
      // Ưu tiên sử dụng selectedOrderId, sau đó đến ID từ orderToUpdate
      const orderId = selectedOrderId || orderToUpdate.id;
      const statusToUpdate = newOrderStatus;
      const messageToSend = statusMessage;
      
      console.log("Values to be sent:");
      console.log("- Order ID:", orderId);
      console.log("- Status to update:", statusToUpdate);
      console.log("- Message:", messageToSend);
      
      // Trước khi gọi API, đóng dialog
      setUpdateStatusDialogOpen(false);
      
      // Kiểm tra ID một lần nữa
      if (!orderId) {
        console.error("ERROR: Order ID is missing");
        showSnackbar('Thiếu ID đơn hàng', 'error');
        return;
      }
      
      // Cập nhật URL với status như một query parameter
      const apiUrl = `http://localhost:1111/api/admin/orders/${orderId}/status?status=${statusToUpdate}`;
      console.log("Sending API request to:", apiUrl);
      
      // Gọi API cập nhật trạng thái
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        // Message có thể vẫn gửi trong body (nếu backend cần)
        body: JSON.stringify({ 
          message: messageToSend
        })
      });
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Không thể cập nhật trạng thái');
      }
      
      // Cập nhật UI
      setOrders(orders.map(order => 
        order.id === orderId
          ? { ...order, orderStatus: statusToUpdate }
          : order
      ));
      
      // Cập nhật orderDetails nếu đang hiển thị
      if (orderDetails && orderDetails.id === orderId) {
        setOrderDetails({...orderDetails, orderStatus: statusToUpdate});
      }
      
      showSnackbar('Cập nhật trạng thái đơn hàng thành công', 'success');
      
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      showSnackbar(error.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setNewOrderStatus('');
      setStatusMessage('');
      setSelectedOrderId(null);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      padding: { xs: 2, sm: 3 },
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          color: '#1976d2',
          borderBottom: '2px solid #1976d2',
          paddingBottom: 1
        }}>
          Trang Quản Trị
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{
            borderRadius: '10px',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            color: 'white',
            padding: '10px 16px',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            '&:hover': {
              background: 'linear-gradient(45deg, #1E88E5 30%, #00ACC1 90%)',
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)'
            }
          }}
        >
          Về Trang Chủ
        </Button>
      </Box>
      
      {renderStats()}
      
      <Paper sx={{ 
        width: '100%', 
        mb: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '12px'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab} 
          aria-label="admin tabs"
          sx={{
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .Mui-selected': {
              fontWeight: 'bold'
            }
          }}
        >
          <Tab 
            label={isMobile ? "Đơn hàng" : "Quản lý đơn hàng"} 
            sx={{ py: 2 }}
          />
          <Tab 
            label={isMobile ? "Sản phẩm" : "Quản lý sản phẩm"} 
            sx={{ py: 2 }}
          />
          <Tab 
            label={isMobile ? "Người dùng" : "Quản lý người dùng"} 
            sx={{ py: 2 }}
          />
        </Tabs>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Tìm kiếm..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: '300px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {tabValue === 1 && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                sx={{ 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {isMobile ? '' : 'Thêm sản phẩm'}
              </Button>
            )}
            
            <Tooltip title="Làm mới dữ liệu">
              <IconButton 
                color="primary" 
                onClick={fetchAllData}
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          </Box>
        
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={fetchAllData}>
                  Thử lại
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}
        
        <Box sx={{ p: 2 }}>
          {loading ? (
            renderSkeletonTable()
          ) : (
            <>
            {/* Tab quản lý đơn hàng */}
            {tabValue === 0 && (
                <>
                  {paginatedData.length > 0 ? (
                    <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                      <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                            <TableCell 
                              onClick={() => handleSort('id')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Mã đơn hàng {renderSortIcon('id')}
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('createdAt')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Ngày đặt {renderSortIcon('createdAt')}
                              </Box>
                            </TableCell>
                            {!isMobile && (
                              <TableCell 
                                onClick={() => handleSort('user')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  Khách hàng {renderSortIcon('user')}
                                </Box>
                              </TableCell>
                            )}
                            {!isMobile && (
                              <TableCell 
                                onClick={() => handleSort('address')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  Địa chỉ {renderSortIcon('address')}
                                </Box>
                              </TableCell>
                            )}
                            <TableCell 
                              onClick={() => handleSort('totalPrice')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Tổng tiền {renderSortIcon('totalPrice')}
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('orderStatus')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Trạng thái đơn hàng {renderSortIcon('orderStatus')}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                          {paginatedData.map((order) => (
                            <TableRow 
                              key={order.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {order.id.toString().substring(0, 8)}
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                              </TableCell>
                              {!isMobile && (
                        <TableCell>
                                  {order.user?.name || order.fullName || 'Không xác định'}
                                </TableCell>
                              )}
                              {!isMobile && (
                                <TableCell>
                                  {order.address || 'Không có địa chỉ'}
                                </TableCell>
                              )}
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {(order.totalAmount || order.totalPrice).toLocaleString('vi-VN')}₫
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={getOrderStatusLabel(order.orderStatus)} 
                                  color={
                                    order.orderStatus === 'COMPLETED' ? 'success' :
                                    order.orderStatus === 'SHIPPING' ? 'info' :
                                    order.orderStatus === 'PROCESSING' ? 'warning' :
                                    order.orderStatus === 'CANCELLED' ? 'error' : 'default'
                                  }
                                  sx={{ 
                                    fontWeight: 'medium',
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Xem chi tiết">
                                  <IconButton 
                                    size="small" 
                                    color="primary" 
                                    onClick={() => handleViewOrderDetails(order)}
                                    sx={{ 
                                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                                      '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.2)'
                                      }
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography>Không có đơn hàng nào</Typography>
                    </Box>
                  )}
                </>
              )}
              
              {/* Tab quản lý sản phẩm */}
            {tabValue === 1 && (
                <>
                  {paginatedData.length > 0 ? (
                    <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                      <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                            <TableCell 
                              onClick={() => handleSort('id')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                ID {renderSortIcon('id')}
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('name')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Tên sản phẩm {renderSortIcon('name')}
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('price')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Giá {renderSortIcon('price')}
                              </Box>
                            </TableCell>
                            {!isMobile && (
                              <TableCell 
                                onClick={() => handleSort('stock')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  Số lượng {renderSortIcon('stock')}
                                </Box>
                              </TableCell>
                            )}
                            <TableCell 
                              onClick={() => handleSort('category')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Danh mục {renderSortIcon('category')}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                          {paginatedData.map((product) => (
                            <TableRow 
                              key={product.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
                              <TableCell>{product.id}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {product.price.toLocaleString('vi-VN')}₫
                              </TableCell>
                              {!isMobile && (
                                <TableCell>{product.stock}</TableCell>
                              )}
                        <TableCell>
                                <Chip 
                                  label={product.category} 
                                  size="small"
                                  sx={{ borderRadius: '16px' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Sửa">
                                    <IconButton 
                                      size="small" 
                                      color="primary" 
                                      onClick={() => handleEditProduct(product)}
                                      sx={{ 
                                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                                        '&:hover': {
                                          bgcolor: 'rgba(25, 118, 210, 0.2)'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => handleDeleteProduct(product)}
                                      sx={{ 
                                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                                        '&:hover': {
                                          bgcolor: 'rgba(211, 47, 47, 0.2)'
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography>Không có sản phẩm nào</Typography>
                    </Box>
                  )}
                </>
            )}
            
            {/* Tab quản lý người dùng */}
            {tabValue === 2 && (
                <>
                  {paginatedData.length > 0 ? (
                    <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                      <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                            <TableCell 
                              sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                STT
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('name')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Tên {renderSortIcon('name')}
                              </Box>
                            </TableCell>
                            {!isMobile && (
                              <TableCell 
                                onClick={() => handleSort('email')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  Email {renderSortIcon('email')}
                                </Box>
                              </TableCell>
                            )}
                            {!isTablet && (
                              <TableCell 
                                onClick={() => handleSort('phone')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  Số điện thoại {renderSortIcon('phone')}
                                </Box>
                              </TableCell>
                            )}
                            <TableCell 
                              onClick={() => handleSort('role')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Vai trò {renderSortIcon('role')}
                              </Box>
                            </TableCell>
                            <TableCell 
                              onClick={() => handleSort('status')}
                              sx={{ cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Trạng thái {renderSortIcon('status')}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                          {paginatedData.map((user, index) => (
                            <TableRow 
                              key={user._id || user.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
                              <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                              <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 30, 
                                    height: 30, 
                                    bgcolor: stringToColor(user.name || user.username || '') 
                                  }}
                                >
                                  {(user.name || user.username || '').charAt(0).toUpperCase()}
                                </Avatar>
                                {user.name || user.username}
                              </TableCell>
                              {!isMobile && (
                        <TableCell>{user.email}</TableCell>
                              )}
                              {!isTablet && (
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                              )}
                        <TableCell>
                                <Chip 
                                  label={user.role || user.roles || 'Người dùng'} 
                                  color={
                                    (user.role || user.roles) === 'Admin' ? 'primary' : 'default'
                                  }
                                  size="small"
                                  sx={{ borderRadius: '16px' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.enabled === false ? 'Bị khóa' : 'Hoạt động'} 
                                  color={user.enabled === false ? 'error' : 'success'}
                                  size="small"
                                  sx={{ borderRadius: '16px' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Khóa tài khoản">
                                  <span>
                                    <IconButton 
                                      size="small" 
                                      color="warning" 
                                      onClick={() => handleBlockUser(user)}
                                      disabled={user.enabled === false}
                                      sx={{ 
                                        bgcolor: user.enabled === false ? 'transparent' : 'rgba(237, 108, 2, 0.1)',
                                        '&:hover': {
                                          bgcolor: 'rgba(237, 108, 2, 0.2)'
                                        }
                                      }}
                                    >
                                      <BlockIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography>Không có người dùng nào</Typography>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
          
          {/* Phân trang */}
          {!loading && filteredData.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={Math.ceil(filteredData.length / rowsPerPage)} 
                page={page} 
                onChange={handleChangePage}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                  }
                }}
              />
          </Box>
        )}
        </Box>
      </Paper>
      
      {/* Dialog xem chi tiết đơn hàng */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          bgcolor: '#f5f5f5'
        }}>
          Chi tiết đơn hàng {orderDetails?._id || orderDetails?.id}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {orderDetails && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Thông tin khách hàng:
                  </Typography>
                  <Paper sx={{ p: 2, borderRadius: '8px' }}>
                    <Typography><strong>Tên:</strong> {orderDetails.user?.name || orderDetails.fullName}</Typography>
                    <Typography><strong>Số điện thoại:</strong> {orderDetails.user?.phone || orderDetails.phoneNumber || orderDetails.phone || 'N/A'}</Typography>
                    <Typography><strong>Địa chỉ:</strong> {orderDetails.address || 'Không có địa chỉ'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Thông tin đơn hàng:
                  </Typography>
                  <Paper sx={{ p: 2, borderRadius: '8px' }}>
                    <Typography><strong>Ngày đặt:</strong> {new Date(orderDetails.createdAt).toLocaleString('vi-VN')}</Typography>
                    <Typography><strong>Tổng tiền:</strong> {(orderDetails.totalAmount || orderDetails.totalPrice).toLocaleString('vi-VN')}₫</Typography>
                    <Typography>
                      <strong>Trạng thái đơn hàng:</strong> 
                      <Chip 
                        label={getOrderStatusLabel(orderDetails.orderStatus)} 
                        color={
                          orderDetails.orderStatus === 'COMPLETED' ? 'success' :
                          orderDetails.orderStatus === 'SHIPPING' ? 'info' :
                          orderDetails.orderStatus === 'PROCESSING' ? 'warning' :
                          orderDetails.orderStatus === 'CANCELLED' ? 'error' : 'default'
                        }
                        size="small"
                        sx={{ ml: 1, borderRadius: '16px' }}
                      />
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                Sản phẩm:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1, borderRadius: '8px', overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Màu sắc</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(orderDetails.items || orderDetails.orderItems)?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.productImage && (
                              <img 
                                src={item.productImage} 
                                alt={item.productName} 
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <Box>
                              {item.product?.name || item.productName || 'Sản phẩm đã xóa'}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.color || 'N/A'}</TableCell>
                        <TableCell align="right">{item.price?.toLocaleString('vi-VN')}₫</TableCell>
                        <TableCell align="right">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                        Tổng sản phẩm: {(orderDetails.items || orderDetails.orderItems)?.reduce((sum, item) => sum + item.quantity, 0)}
                      </TableCell>
                      <TableCell />
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng cộng:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {(orderDetails.totalAmount || orderDetails.totalPrice).toLocaleString('vi-VN')}₫
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleOpenUpdateStatus}
            sx={{ 
              borderRadius: '8px',
              marginRight: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }
            }}
          >
            Cập nhật trạng thái
          </Button>
          <Button 
            onClick={() => setOrderDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog khóa người dùng */}
      <Dialog
        open={blockUserDialogOpen}
        onClose={() => setBlockUserDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          color: '#ed6c02',
          bgcolor: '#fff3e0'
        }}>
          Xác nhận khóa tài khoản
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography>
            Bạn có chắc chắn muốn khóa tài khoản của người dùng <strong>{selectedItem?.name || selectedItem?.username || ''}</strong> không? 
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Người dùng sẽ không thể đăng nhập sau khi bị khóa.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setBlockUserDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={confirmBlockUser} 
            color="warning"
            variant="contained"
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }
            }}
          >
            Khóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xóa sản phẩm */}
      <Dialog
        open={deleteProductDialogOpen}
        onClose={() => setDeleteProductDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          color: '#d32f2f',
          bgcolor: '#ffebee'
        }}>
          Xác nhận xóa sản phẩm
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedItem?.name || ''}</strong> không?
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setDeleteProductDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={confirmDeleteProduct} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog thêm sản phẩm mới */}
      <Dialog
        open={addProductDialogOpen}
        onClose={() => setAddProductDialogOpen(false)}
        maxWidth={false}
        className="product-dialog"
        PaperProps={{
          className: "product-dialog-paper",
          sx: { overflow: 'visible' }
        }}
      >
        <DialogTitle className="product-dialog-title">
          Thêm sản phẩm mới
          <IconButton
            onClick={() => setAddProductDialogOpen(false)}
            className="product-dialog-close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="product-dialog-content">
          {/* Thông tin cơ bản */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Thông tin cơ bản
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Tên sản phẩm"
                  fullWidth
                  name="name"
                  value={newProduct.name}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Danh mục"
                  fullWidth
                  name="category"
                  value={newProduct.category}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Số lượng"
                  fullWidth
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                  required
                />
              </Grid>
            </Grid>
          </div>
          
          {/* Mô tả sản phẩm */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Mô tả sản phẩm
            </Typography>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={6}
              name="description"
              value={newProduct.description}
              onChange={handleProductInputChange}
              variant="filled"
              className="product-form-field product-description-field"
            />
          </div>
          
          {/* Thông tin chi tiết */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Thông số kỹ thuật
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Màn hình"
                  fullWidth
                  name="detail.screen"
                  value={newProduct.detail.screen}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hệ điều hành"
                  fullWidth
                  name="detail.os"
                  value={newProduct.detail.os}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Camera sau"
                  fullWidth
                  name="detail.camera"
                  value={newProduct.detail.camera}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Camera trước"
                  fullWidth
                  name="detail.cameraFront"
                  value={newProduct.detail.cameraFront}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="CPU"
                  fullWidth
                  name="detail.cpu"
                  value={newProduct.detail.cpu}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Pin"
                  fullWidth
                  name="detail.battery"
                  value={newProduct.detail.battery}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
            </Grid>
          </div>
          
          {/* Biến thể sản phẩm */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Biến thể sản phẩm
            </Typography>
            <div className="product-variants-container">
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="product-variant-item">
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      className="product-variant-remove"
                      onClick={() => {
                        setNewProduct(prev => {
                          const newVariants = [...prev.variants];
                          newVariants.splice(index, 1);
                          return { ...prev, variants: newVariants };
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="RAM"
                        fullWidth
                        name={`variants[${index}].ram`}
                        value={variant.ram}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="ROM"
                        fullWidth
                        name={`variants[${index}].rom`}
                        value={variant.rom}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Giá"
                        fullWidth
                        type="number"
                        name={`variants[${index}].price`}
                        value={variant.price}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₫</InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                </div>
              ))}
            </div>
            <Button 
              startIcon={<AddIcon />}
              onClick={() => {
                setNewProduct(prev => ({
                  ...prev,
                  variants: [...prev.variants, { ram: '', rom: '', price: '' }]
                }));
              }}
              className="product-form-button-add"
            >
              Thêm biến thể
            </Button>
          </div>
          
          {/* Thêm màu sắc và hình ảnh */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Màu sắc và hình ảnh
            </Typography>
            <div className="product-colors-container">
              {newProduct.colors.map((color, index) => (
                <div key={index} className="product-color-item">
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      className="product-color-remove"
                      onClick={() => {
                        setNewProduct(prev => {
                          const newColors = [...prev.colors];
                          newColors.splice(index, 1);
                          return { ...prev, colors: newColors };
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Tên màu"
                        fullWidth
                        name={`colors[${index}].colorName`}
                        value={color.colorName}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`colors-image-${index}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, `colors[${index}].image`)}
                      />
                      
                      {color.image ? (
                        <Box sx={{ textAlign: 'center' }}>
                          <Box>
                            {typeof color.image === 'string' ? (
                              <img
                                src={color.image}
                                alt={`Color ${color.colorName}`}
                                className="product-image-preview"
                              />
                            ) : (
                              <img
                                src={URL.createObjectURL(color.image)}
                                alt={`Color ${color.colorName}`}
                                className="product-image-preview"
                              />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {typeof color.image === 'string' ? color.image.split('/').pop() : color.image.name}
                            </Typography>
                          </Box>
                          <label htmlFor={`colors-image-${index}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              size="small"
                              sx={{ mt: 1, borderRadius: '20px', fontSize: '0.7rem' }}
                            >
                              Thay đổi ảnh
                            </Button>
                          </label>
                        </Box>
                      ) : (
                        <label htmlFor={`colors-image-${index}`} className="product-image-upload">
                          <div className="product-image-upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                            </svg>
                          </div>
                          <Typography variant="body2" color="primary">
                            Chọn ảnh màu sắc
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (PNG, JPG tối đa 5MB)
                          </Typography>
                        </label>
                      )}
                    </Grid>
                  </Grid>
                </div>
              ))}
            </div>
            <Button 
              startIcon={<AddIcon />}
              onClick={() => {
                setNewProduct(prev => ({
                  ...prev,
                  colors: [...prev.colors, { colorName: '', image: null }]
                }));
              }}
              className="product-form-button-add"
            >
              Thêm màu sắc
            </Button>
          </div>
        </DialogContent>
        <DialogActions className="product-form-actions">
          <Button 
            onClick={() => setAddProductDialogOpen(false)}
            variant="outlined"
            className="product-form-button-cancel"
          >
            Hủy
          </Button>
          <Button 
            onClick={submitNewProduct} 
            color="primary"
            variant="contained"
            className="product-form-button-submit"
          >
            Thêm sản phẩm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog sửa sản phẩm */}
      <Dialog
        open={editProductDialogOpen}
        onClose={() => setEditProductDialogOpen(false)}
        maxWidth={false}
        className="product-dialog"
        PaperProps={{
          className: "product-dialog-paper",
          sx: { overflow: 'visible' }
        }}
      >
        <DialogTitle className="product-dialog-title">
          Sửa sản phẩm
          <IconButton
            onClick={() => setEditProductDialogOpen(false)}
            className="product-dialog-close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="product-dialog-content">
          {/* Thông tin cơ bản */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Thông tin cơ bản
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Tên sản phẩm"
                  fullWidth
                  name="name"
                  value={newProduct.name}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Danh mục"
                  fullWidth
                  name="category"
                  value={newProduct.category}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Số lượng"
                  fullWidth
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                  required
                />
              </Grid>
            </Grid>
          </div>
          
          {/* Mô tả sản phẩm */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Mô tả sản phẩm
            </Typography>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              name="description"
              value={newProduct.description}
              onChange={handleProductInputChange}
              variant="filled"
              className="product-form-field product-description-field"
            />
          </div>
          
          {/* Thông tin chi tiết */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Thông số kỹ thuật
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Màn hình"
                  fullWidth
                  name="detail.screen"
                  value={newProduct.detail.screen}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hệ điều hành"
                  fullWidth
                  name="detail.os"
                  value={newProduct.detail.os}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Camera sau"
                  fullWidth
                  name="detail.camera"
                  value={newProduct.detail.camera}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Camera trước"
                  fullWidth
                  name="detail.cameraFront"
                  value={newProduct.detail.cameraFront}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="CPU"
                  fullWidth
                  name="detail.cpu"
                  value={newProduct.detail.cpu}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Pin"
                  fullWidth
                  name="detail.battery"
                  value={newProduct.detail.battery}
                  onChange={handleProductInputChange}
                  variant="filled"
                  className="product-form-field"
                />
              </Grid>
            </Grid>
          </div>
          
          {/* Biến thể sản phẩm */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Biến thể sản phẩm
            </Typography>
            <div className="product-variants-container">
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="product-variant-item">
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      className="product-variant-remove"
                      onClick={() => {
                        setNewProduct(prev => {
                          const newVariants = [...prev.variants];
                          newVariants.splice(index, 1);
                          return { ...prev, variants: newVariants };
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="RAM"
                        fullWidth
                        name={`variants[${index}].ram`}
                        value={variant.ram}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="ROM"
                        fullWidth
                        name={`variants[${index}].rom`}
                        value={variant.rom}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Giá"
                        fullWidth
                        type="number"
                        name={`variants[${index}].price`}
                        value={variant.price}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₫</InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                </div>
              ))}
            </div>
            <Button 
              startIcon={<AddIcon />}
              onClick={() => {
                setNewProduct(prev => ({
                  ...prev,
                  variants: [...prev.variants, { ram: '', rom: '', price: '' }]
                }));
              }}
              className="product-form-button-add"
            >
              Thêm biến thể
            </Button>
          </div>
          
          {/* Thêm màu sắc và hình ảnh */}
          <div className="product-form-section">
            <Typography className="product-form-section-title">
              <InfoIcon /> Màu sắc và hình ảnh
            </Typography>
            <div className="product-colors-container">
              {newProduct.colors.map((color, index) => (
                <div key={index} className="product-color-item">
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      className="product-color-remove"
                      onClick={() => {
                        setNewProduct(prev => {
                          const newColors = [...prev.colors];
                          newColors.splice(index, 1);
                          return { ...prev, colors: newColors };
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Tên màu"
                        fullWidth
                        name={`colors[${index}].colorName`}
                        value={color.colorName}
                        onChange={handleProductInputChange}
                        variant="filled"
                        className="product-form-field"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`edit-colors-image-${index}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, `colors[${index}].image`)}
                      />
                      
                      {color.image ? (
                        <Box sx={{ textAlign: 'center' }}>
                          <Box>
                            {typeof color.image === 'string' ? (
                              <img
                                src={color.image}
                                alt={`Color ${color.colorName}`}
                                className="product-image-preview"
                              />
                            ) : (
                              <img
                                src={URL.createObjectURL(color.image)}
                                alt={`Color ${color.colorName}`}
                                className="product-image-preview"
                              />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {typeof color.image === 'string' ? color.image.split('/').pop() : color.image.name}
                            </Typography>
                          </Box>
                          <label htmlFor={`edit-colors-image-${index}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              size="small"
                              sx={{ mt: 1, borderRadius: '20px', fontSize: '0.7rem' }}
                            >
                              Thay đổi ảnh
                            </Button>
                          </label>
                        </Box>
                      ) : (
                        <label htmlFor={`edit-colors-image-${index}`} className="product-image-upload">
                          <div className="product-image-upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                            </svg>
                          </div>
                          <Typography variant="body2" color="primary">
                            Chọn ảnh màu sắc
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (PNG, JPG tối đa 5MB)
                          </Typography>
                        </label>
                      )}
                    </Grid>
                  </Grid>
                </div>
              ))}
            </div>
            <Button 
              startIcon={<AddIcon />}
              onClick={() => {
                setNewProduct(prev => ({
                  ...prev,
                  colors: [...prev.colors, { colorName: '', image: null }]
                }));
              }}
              className="product-form-button-add"
            >
              Thêm màu sắc
            </Button>
          </div>
        </DialogContent>
        <DialogActions className="product-form-actions">
          <Button 
            onClick={() => setEditProductDialogOpen(false)}
            variant="outlined"
            className="product-form-button-cancel"
          >
            Hủy
          </Button>
          <Button 
            onClick={submitEditProduct} 
            color="primary"
            variant="contained"
            className="product-form-button-submit"
          >
            Cập nhật sản phẩm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Dialog cập nhật trạng thái đơn hàng */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={() => setUpdateStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon fontSize="small" />
            Cập nhật trạng thái đơn hàng #{orderDetails?.id}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium', color: '#555' }}>
            Chọn trạng thái mới
          </Typography>
          <FormControl 
            fullWidth 
            variant="outlined" 
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(78, 84, 200, 0.2)'
                }
              }
            }}
          >
            <InputLabel>Trạng thái đơn hàng</InputLabel>
            <Select
              value={newOrderStatus || ''}
              onChange={(e) => setNewOrderStatus(e.target.value)}
              label="Trạng thái đơn hàng"
            >
              <MenuItem value="PROCESSING" sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FaHourglassHalf style={{ color: '#ffc107', fontSize: '1.2rem' }} />
                  <Typography>Đang xử lý</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="SHIPPING" sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FaTruck style={{ color: '#17a2b8', fontSize: '1.2rem' }} />
                  <Typography>Đang vận chuyển</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="COMPLETED" sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FaCheckCircle style={{ color: '#28a745', fontSize: '1.2rem' }} />
                  <Typography>Đã giao hàng</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="CANCELLED" sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FaTimesCircle style={{ color: '#dc3545', fontSize: '1.2rem' }} />
                  <Typography>Đã hủy</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium', color: '#555' }}>
              Tin nhắn thông báo
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              variant="outlined"
              placeholder="Ví dụ: Đơn hàng của bạn đang được vận chuyển và sẽ đến trong 2-3 ngày tới..."
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(78, 84, 200, 0.2)'
                  }
                }
              }}
            />
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: '10px',
            border: '1px dashed #dee2e6',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <InfoIcon color="primary" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Tin nhắn này sẽ được gửi qua email đến khách hàng khi trạng thái đơn hàng được cập nhật.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
          <Button 
            onClick={() => setUpdateStatusDialogOpen(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: '8px',
              px: 2.5
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateOrderStatus}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Hàm tạo màu từ chuỗi
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export default AdminDashboard; 
