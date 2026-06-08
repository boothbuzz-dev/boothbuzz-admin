import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Save, 
  ArrowLeft,
  Package,
  Tag,
  Image as ImageIcon,
  FileText,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Camera,
  Link as LinkIcon,
  Globe,
  Award,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  price: {
    min: number;
    max: number;
    currency: string;
    type: 'fixed' | 'range' | 'quote';
  };
  images: string[];
  videos: string[];
  documents: string[];
  specifications: { [key: string]: string };
  features: string[];
  benefits: string[];
  targetAudience: string[];
  tags: string[];
  status: 'draft' | 'active' | 'featured' | 'discontinued';
  priority: 'low' | 'medium' | 'high' | 'featured';
  launchDate: string;
  availability: 'in_stock' | 'limited' | 'pre_order' | 'out_of_stock';
  certifications: string[];
  awards: string[];
  socialProof: {
    testimonials: number;
    rating: number;
    reviews: number;
  };
  analytics: {
    views: number;
    inquiries: number;
    downloads: number;
    shares: number;
  };
  seo: {
    keywords: string[];
    metaDescription: string;
  };
  exhibitionDetails: {
    boothDisplay: boolean;
    demoAvailable: boolean;
    samplesAvailable: boolean;
    liveDemo: boolean;
    interactiveDisplay: boolean;
  };
}

interface ProductFormData {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  priceType: 'fixed' | 'range' | 'quote';
  minPrice: string;
  maxPrice: string;
  currency: string;
  features: string[];
  benefits: string[];
  targetAudience: string[];
  tags: string[];
  status: 'draft' | 'active' | 'featured' | 'discontinued';
  priority: 'low' | 'medium' | 'high' | 'featured';
  availability: 'in_stock' | 'limited' | 'pre_order' | 'out_of_stock';
  certifications: string[];
  awards: string[];
  keywords: string[];
  metaDescription: string;
  boothDisplay: boolean;
  demoAvailable: boolean;
  samplesAvailable: boolean;
  liveDemo: boolean;
  interactiveDisplay: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Smart Home Security System',
    category: 'Technology',
    subcategory: 'Security Systems',
    description: 'Advanced AI-powered home security system with facial recognition, motion detection, and smart alerts. Features include 4K cameras, cloud storage, mobile app control, and integration with smart home devices.',
    shortDescription: 'AI-powered home security with 4K cameras and smart alerts',
    price: { min: 15000, max: 45000, currency: 'INR', type: 'range' },
    images: ['product1-1.jpg', 'product1-2.jpg', 'product1-3.jpg'],
    videos: ['demo1.mp4'],
    documents: ['brochure1.pdf', 'specs1.pdf'],
    specifications: {
      'Camera Resolution': '4K Ultra HD',
      'Storage': 'Cloud + Local',
      'Connectivity': 'WiFi, Ethernet',
      'Power': 'PoE/DC Adapter',
      'Operating Temperature': '-10°C to 50°C'
    },
    features: ['AI Facial Recognition', '4K Recording', 'Night Vision', 'Mobile Alerts', 'Cloud Storage'],
    benefits: ['24/7 Security', 'Easy Installation', 'Remote Monitoring', 'Smart Integration'],
    targetAudience: ['Homeowners', 'Small Businesses', 'Property Managers'],
    tags: ['security', 'smart-home', 'AI', '4K', 'wireless'],
    status: 'featured',
    priority: 'featured',
    launchDate: '2024-01-15',
    availability: 'in_stock',
    certifications: ['CE', 'FCC', 'BIS'],
    awards: ['Best Security Product 2024'],
    socialProof: { testimonials: 45, rating: 4.8, reviews: 128 },
    analytics: { views: 2450, inquiries: 89, downloads: 156, shares: 34 },
    seo: { keywords: ['smart security', 'home security', 'AI camera'], metaDescription: 'Advanced AI-powered home security system with 4K cameras' },
    exhibitionDetails: { boothDisplay: true, demoAvailable: true, samplesAvailable: false, liveDemo: true, interactiveDisplay: true }
  },
  {
    id: '2',
    name: 'Eco-Friendly Water Purifier',
    category: 'Health & Wellness',
    subcategory: 'Water Treatment',
    description: 'Revolutionary water purification system using advanced filtration technology without electricity. Removes 99.9% of contaminants while retaining essential minerals.',
    shortDescription: 'Electricity-free water purifier with advanced filtration',
    price: { min: 8000, max: 8000, currency: 'INR', type: 'fixed' },
    images: ['product2-1.jpg', 'product2-2.jpg'],
    videos: [],
    documents: ['manual2.pdf'],
    specifications: {
      'Filtration Capacity': '10 Liters/Hour',
      'Filter Life': '12 Months',
      'Contaminant Removal': '99.9%',
      'Power Requirement': 'None',
      'Dimensions': '45x30x25 cm'
    },
    features: ['No Electricity Required', 'Multi-Stage Filtration', 'Mineral Retention', 'Easy Maintenance'],
    benefits: ['Cost Effective', 'Eco-Friendly', 'Pure Water', 'Low Maintenance'],
    targetAudience: ['Households', 'Rural Areas', 'Offices'],
    tags: ['water-purifier', 'eco-friendly', 'no-electricity', 'health'],
    status: 'active',
    priority: 'high',
    launchDate: '2024-02-01',
    availability: 'in_stock',
    certifications: ['NSF', 'WQA', 'BIS'],
    awards: [],
    socialProof: { testimonials: 23, rating: 4.6, reviews: 67 },
    analytics: { views: 1890, inquiries: 56, downloads: 89, shares: 12 },
    seo: { keywords: ['water purifier', 'eco-friendly', 'no electricity'], metaDescription: 'Eco-friendly water purifier without electricity requirement' },
    exhibitionDetails: { boothDisplay: true, demoAvailable: true, samplesAvailable: true, liveDemo: false, interactiveDisplay: false }
  },
  {
    id: '3',
    name: 'Organic Skincare Range',
    category: 'Beauty & Personal Care',
    subcategory: 'Skincare',
    description: 'Premium organic skincare products made from natural ingredients. Includes face wash, moisturizer, serum, and sunscreen for complete skincare routine.',
    shortDescription: 'Premium organic skincare products with natural ingredients',
    price: { min: 0, max: 0, currency: 'INR', type: 'quote' },
    images: ['product3-1.jpg', 'product3-2.jpg', 'product3-3.jpg', 'product3-4.jpg'],
    videos: ['skincare-demo.mp4'],
    documents: ['ingredients.pdf', 'usage-guide.pdf'],
    specifications: {
      'Product Count': '4 Products',
      'Skin Type': 'All Skin Types',
      'Ingredients': '100% Organic',
      'Shelf Life': '24 Months',
      'Packaging': 'Eco-Friendly'
    },
    features: ['100% Organic', 'Dermatologist Tested', 'Cruelty Free', 'Eco Packaging'],
    benefits: ['Natural Glow', 'Anti-Aging', 'Gentle Formula', 'Sustainable'],
    targetAudience: ['Women 25-45', 'Health Conscious', 'Eco-Friendly Consumers'],
    tags: ['organic', 'skincare', 'natural', 'eco-friendly', 'beauty'],
    status: 'active',
    priority: 'medium',
    launchDate: '2024-01-20',
    availability: 'in_stock',
    certifications: ['Organic Certified', 'Cruelty Free'],
    awards: ['Best Organic Product 2024'],
    socialProof: { testimonials: 78, rating: 4.9, reviews: 234 },
    analytics: { views: 3200, inquiries: 145, downloads: 267, shares: 89 },
    seo: { keywords: ['organic skincare', 'natural beauty', 'eco-friendly'], metaDescription: 'Premium organic skincare range with natural ingredients' },
    exhibitionDetails: { boothDisplay: true, demoAvailable: false, samplesAvailable: true, liveDemo: false, interactiveDisplay: false }
  }
];

const productCategories = {
  'Technology': ['Security Systems', 'Smart Devices', 'Software', 'Hardware', 'IoT Solutions'],
  'Health & Wellness': ['Water Treatment', 'Air Purification', 'Fitness Equipment', 'Medical Devices'],
  'Beauty & Personal Care': ['Skincare', 'Haircare', 'Cosmetics', 'Personal Hygiene'],
  'Home & Garden': ['Furniture', 'Decor', 'Gardening', 'Kitchen Appliances'],
  'Fashion & Apparel': ['Clothing', 'Accessories', 'Footwear', 'Jewelry'],
  'Food & Beverage': ['Organic Foods', 'Beverages', 'Snacks', 'Health Foods'],
  'Automotive': ['Parts & Accessories', 'Electronics', 'Maintenance', 'Safety'],
  'Education': ['Learning Tools', 'Books', 'Software', 'Equipment'],
  'Sports & Fitness': ['Equipment', 'Apparel', 'Supplements', 'Accessories'],
  'Business Services': ['Software', 'Consulting', 'Marketing', 'Finance']
};

const currencies = ['INR', 'USD', 'EUR', 'GBP'];

export const ProductsShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    shortDescription: '',
    priceType: 'fixed',
    minPrice: '',
    maxPrice: '',
    currency: 'INR',
    features: [],
    benefits: [],
    targetAudience: [],
    tags: [],
    status: 'draft',
    priority: 'medium',
    availability: 'in_stock',
    certifications: [],
    awards: [],
    keywords: [],
    metaDescription: '',
    boothDisplay: true,
    demoAvailable: false,
    samplesAvailable: false,
    liveDemo: false,
    interactiveDisplay: false
  });

  const [newFeature, setNewFeature] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'featured': return 'error';
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'discontinued': return 'default';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'featured': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getAvailabilityVariant = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'success';
      case 'limited': return 'warning';
      case 'pre_order': return 'info';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'features' | 'benefits' | 'tags' | 'keywords', value: string, setValue: (value: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (field: 'features' | 'benefits' | 'tags' | 'keywords', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: {
        min: formData.priceType === 'quote' ? 0 : parseFloat(formData.minPrice) || 0,
        max: formData.priceType === 'fixed' ? parseFloat(formData.minPrice) || 0 : 
             formData.priceType === 'quote' ? 0 : parseFloat(formData.maxPrice) || 0,
        currency: formData.currency,
        type: formData.priceType
      },
      images: [],
      videos: [],
      documents: [],
      specifications: {},
      features: formData.features,
      benefits: formData.benefits,
      targetAudience: formData.targetAudience,
      tags: formData.tags,
      status: formData.status,
      priority: formData.priority,
      launchDate: new Date().toISOString().split('T')[0],
      availability: formData.availability,
      certifications: formData.certifications,
      awards: formData.awards,
      socialProof: { testimonials: 0, rating: 0, reviews: 0 },
      analytics: { views: 0, inquiries: 0, downloads: 0, shares: 0 },
      seo: { keywords: formData.keywords, metaDescription: formData.metaDescription },
      exhibitionDetails: {
        boothDisplay: formData.boothDisplay,
        demoAvailable: formData.demoAvailable,
        samplesAvailable: formData.samplesAvailable,
        liveDemo: formData.liveDemo,
        interactiveDisplay: formData.interactiveDisplay
      }
    };

    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      shortDescription: '',
      priceType: 'fixed',
      minPrice: '',
      maxPrice: '',
      currency: 'INR',
      features: [],
      benefits: [],
      targetAudience: [],
      tags: [],
      status: 'draft',
      priority: 'medium',
      availability: 'in_stock',
      certifications: [],
      awards: [],
      keywords: [],
      metaDescription: '',
      boothDisplay: true,
      demoAvailable: false,
      samplesAvailable: false,
      liveDemo: false,
      interactiveDisplay: false
    });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for products:`, selectedProducts);
    setSelectedProducts([]);
  };

  const stats = {
    total: products.length,
    featured: products.filter(p => p.status === 'featured').length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    totalViews: products.reduce((sum, p) => sum + p.analytics.views, 0),
    totalInquiries: products.reduce((sum, p) => sum + p.analytics.inquiries, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/exhibitors')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Exhibitors</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products to Showcase</h1>
            <p className="text-gray-600">Manage your exhibition product catalog and showcase</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            <span>Export Catalog</span>
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.featured}</div>
            <div className="text-xs sm:text-sm text-gray-600">Featured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.draft}</div>
            <div className="text-xs sm:text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{(stats.totalViews / 1000).toFixed(1)}K</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.totalInquiries}</div>
            <div className="text-xs sm:text-sm text-gray-600">Inquiries</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.keys(productCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="featured">Featured</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')}>
                  <Star className="h-4 w-4 mr-1" />
                  Feature
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant={getStatusVariant(product.status)}>
                      {product.status}
                    </Badge>
                    {product.priority === 'featured' && (
                      <Badge variant="error">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{product.shortDescription}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="default">{product.category}</Badge>
                    <Badge variant={getAvailabilityVariant(product.availability)}>
                      {product.availability.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {product.price.type === 'quote' ? 'Price on Request' :
                       product.price.type === 'fixed' ? `${product.price.currency} ${product.price.min.toLocaleString()}` :
                       `${product.price.currency} ${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{product.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {product.analytics.views} views
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {product.analytics.inquiries} inquiries
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    {product.socialProof.rating}/5 ({product.socialProof.reviews})
                  </div>
                  <div className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {product.analytics.downloads} downloads
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    {product.exhibitionDetails.boothDisplay && (
                      <Badge variant="info" className="text-xs">Booth Display</Badge>
                    )}
                    {product.exhibitionDetails.demoAvailable && (
                      <Badge variant="success" className="text-xs">Demo</Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Products Catalog ({filteredProducts.length})
              </h3>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                Advanced Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Exhibition</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{product.shortDescription}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="default">{product.category}</Badge>
                        <div className="text-xs text-gray-500 mt-1">{product.subcategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {product.price.type === 'quote' ? 'Quote' :
                         product.price.type === 'fixed' ? `${product.price.currency} ${product.price.min.toLocaleString()}` :
                         `${product.price.currency} ${product.price.min.toLocaleString()}-${product.price.max.toLocaleString()}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getStatusVariant(product.status)}>
                          {product.status}
                        </Badge>
                        <Badge variant={getAvailabilityVariant(product.availability)} className="text-xs">
                          {product.availability.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.analytics.views}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {product.analytics.inquiries}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {product.socialProof.rating}/5
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.exhibitionDetails.boothDisplay && (
                          <Badge variant="info" className="text-xs">Booth</Badge>
                        )}
                        {product.exhibitionDetails.demoAvailable && (
                          <Badge variant="success" className="text-xs">Demo</Badge>
                        )}
                        {product.exhibitionDetails.samplesAvailable && (
                          <Badge variant="warning" className="text-xs">Samples</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('subcategory', '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {Object.keys(productCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory *
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select subcategory</option>
                      {productCategories[formData.category as keyof typeof productCategories]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="featured">Featured</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief product description for listings"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed product description"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Type
                    </label>
                    <select
                      value={formData.priceType}
                      onChange={(e) => handleInputChange('priceType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="range">Price Range</option>
                      <option value="quote">Quote on Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

                  {formData.priceType !== 'quote' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.priceType === 'fixed' ? 'Price' : 'Min Price'}
                      </label>
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  )}

                  {formData.priceType === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Price
                      </label>
                      <input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a feature"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('features', newFeature, setNewFeature))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addToArray('features', newFeature, setNewFeature)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="default" className="flex items-center space-x-1">
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFromArray('features', index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Benefits
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a benefit"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('benefits', newBenefit, setNewBenefit))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addToArray('benefits', newBenefit, setNewBenefit)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit, index) => (
                        <Badge key={index} variant="success" className="flex items-center space-x-1">
                          <span>{benefit}</span>
                          <button
                            type="button"
                            onClick={() => removeFromArray('benefits', index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags and SEO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tags & SEO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', newTag, setNewTag))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addToArray('tags', newTag, setNewTag)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="info" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeFromArray('tags', index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a keyword"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('keywords', newKeyword, setNewKeyword))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addToArray('keywords', newKeyword, setNewKeyword)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="warning" className="flex items-center space-x-1">
                          <span>{keyword}</span>
                          <button
                            type="button"
                            onClick={() => removeFromArray('keywords', index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO meta description for search engines"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>
              </div>

              {/* Exhibition Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Exhibition Display Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="boothDisplay"
                      checked={formData.boothDisplay}
                      onChange={(e) => handleInputChange('boothDisplay', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="boothDisplay" className="ml-2 block text-sm text-gray-700">
                      Display at Booth
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="demoAvailable"
                      checked={formData.demoAvailable}
                      onChange={(e) => handleInputChange('demoAvailable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="demoAvailable" className="ml-2 block text-sm text-gray-700">
                      Demo Available
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="samplesAvailable"
                      checked={formData.samplesAvailable}
                      onChange={(e) => handleInputChange('samplesAvailable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="samplesAvailable" className="ml-2 block text-sm text-gray-700">
                      Samples Available
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="liveDemo"
                      checked={formData.liveDemo}
                      onChange={(e) => handleInputChange('liveDemo', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="liveDemo" className="ml-2 block text-sm text-gray-700">
                      Live Demo Sessions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="interactiveDisplay"
                      checked={formData.interactiveDisplay}
                      onChange={(e) => handleInputChange('interactiveDisplay', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="interactiveDisplay" className="ml-2 block text-sm text-gray-700">
                      Interactive Display
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited Stock</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};