import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserPlus, Mail, Search, Filter, Eye, User as UserIcon, MapPin } from 'lucide-react';
import { PhoneInput } from '../components/UI/PhoneInput';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useSupabaseData';
import { X, Save, AlertTriangle } from 'lucide-react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  password: string;
  confirmPassword: string;
  status: 'active' | 'inactive';
  sendWelcomeEmail: boolean;
}

interface FormErrors {
  [key: string]: string;
}
// Modal Wrapper Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// View User Modal Component
const ViewUserModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void }> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  function getRoleVariant(role: string): "default" | "error" | "success" | "warning" | "info" | undefined {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'support_tech':
        return 'info';
      case 'sales_marketing':
        return 'success';
      case 'accounting':
      case 'logistics':
        return 'default';
      default:
        return 'default';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <p className="text-gray-600">User information</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-700">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getRoleVariant(user.role)}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 rounded-lg">{user.name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-3 bg-gray-50 rounded-lg">{user.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="p-3 bg-gray-50 rounded-lg">{user.phone || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="p-3 bg-gray-50 rounded-lg">{user.city || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Badge variant={getRoleVariant(user.role)}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {user.last_login ? (
                    <div>
                      <div>{new Date(user.last_login).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.last_login).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    'Never'
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: User) => void;
  setFormData: (user: User | null) => void;
}> = ({ user, isOpen, onClose, onSave, setFormData }) => {
  if (!user || !isOpen) return null;
  
  const [errors, setErrors] = useState<FormErrors>({});
  const { hasRole } = useAuth();

  const validateForm = (formData: User): boolean => {
    const newErrors: FormErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone || !formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (formData.role !== 'super_admin' && !formData.city) newErrors.city = 'City is required for this role';
    
    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone format validation
    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof User, value: any) => {
    const updatedUser = { ...user, [field]: value };
    setFormData(updatedUser);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = () => {
    if (!user) return;
    if (!validateForm(user)) return;
    onSave(user);
  };

  if (!hasRole(['super_admin'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to edit users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <p className="text-gray-600">Update user information</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>

              <div>
                <PhoneInput
                  label="Phone"
                  value={user.phone || ''}
                  onChange={(value) => handleChange('phone', value)}
                  required={true}
                  error={errors.phone}
                  name="phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={user.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="support_tech">Support Tech</option>
                  <option value="sales_marketing">Sales & Marketing</option>
                  <option value="logistics">Logistics</option>
                  <option value="accounting">Accounting</option>
                </select>
                {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={user.city || ''}
                  onChange={e => handleChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={user.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{ user: User | null; isOpen: boolean; onClose: () => void; onConfirm: (id: string) => void }> = ({ user, isOpen, onClose, onConfirm }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <strong>{user.name}</strong> ({user.email})?
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => onConfirm(user.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete User</span>
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};


export const Users: React.FC = () => {
  const { users, loading, error, refetch } = useUsers();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { hasRole, isSuperAdmin } = useAuth();
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [editFormData, setEditFormData] = useState<User | null>(null);

  if (!hasRole(['super_admin', 'admin'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    return matchesFilter && matchesSearch;
  });

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'support_tech': return 'info';
      case 'sales_marketing': return 'success';
      case 'accounting': return 'default';
      case 'logistics': return 'default';
      case 'accounts': case 'sales': case 'marketing': case 'city_head': return 'info';
      default: return 'default';
    }
  };

  const allRoleKeys = ['super_admin', 'admin', 'support_tech', 'sales_marketing', 'accounting', 'logistics', 'accounts', 'sales', 'marketing', 'city_head'];
  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    support_tech: users.filter(u => u.role === 'support_tech').length,
    sales_marketing: users.filter(u => u.role === 'sales_marketing').length,
    accounting: users.filter(u => u.role === 'accounting').length,
    logistics: users.filter(u => u.role === 'logistics').length,
    accounts: users.filter(u => u.role === 'accounts').length,
    sales: users.filter(u => u.role === 'sales').length,
    marketing: users.filter(u => u.role === 'marketing').length,
    city_head: users.filter(u => u.role === 'city_head').length,
    other: users.filter(u => !allRoleKeys.includes(u.role)).length
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    // Implement bulk actions here
    setSelectedUsers([]);
  };

  const handleView = (user: User) => {
    setViewModal({ isOpen: true, user });
  };

  // 2. When editing, set editFormData and open modal
  const handleUpdate = (user: User) => {
    // Only open modal if it's not already open or if it's a different user
    if (!editModal.isOpen || editModal.user?.id !== user.id) {
      setEditFormData(user);
      setEditModal({ isOpen: true, user });
    }
  };

  // 3. Update user in Supabase in Users page
  const handleSaveEdit = async (formData: User) => {
    try {
      console.log('formData:', formData);
      
      // Get the authenticated user from Supabase
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.session?.user) {
        console.error('Session error:', sessionError || 'User not authenticated');
        showNotification('You must be logged in to update user data', 'error');
        return;
      }

      const authenticatedUser = session.session.user;
      console.log('Authenticated user:', authenticatedUser);

      // First, check if the authenticated user exists in our users table
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('id, role, email, organization_id')
        .eq('email', authenticatedUser.email)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching current user:', userError);
        showNotification('Error fetching user data: ' + userError.message, 'error');
        return;
      }

      if (!currentUser) {
        console.error('Current user not found in database');
        showNotification('User not found in database. Please contact administrator.', 'error');
        return;
      }

      console.log('Current user from database:', currentUser);

      if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin' && formData.id !== currentUser.id) {
        showNotification('You can only update your own profile', 'error');
        return;
      }

      // For super_admin, also verify the target user exists
      if (currentUser.role === 'super_admin' && formData.id !== currentUser.id) {
        const { data: targetUser, error: targetError } = await supabase
          .from('users')
          .select('id')
          .eq('id', formData.id)
          .maybeSingle();

        if (targetError) {
          console.error('Error fetching target user:', targetError);
          showNotification('Error fetching target user: ' + targetError.message, 'error');
          return;
        }

        if (!targetUser) {
          console.error('Target user not found');
          showNotification('User to be updated not found in database', 'error');
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        city: formData.city,
        status: formData.status
      };

      console.log('Updating user with data:', updateData);

      // Perform the update
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', formData.id);

      if (error) {
        console.error('Supabase update error:', error);
        showNotification('Failed to update user: ' + error.message, 'error');
      } else {
        showNotification('User updated successfully!', 'success');
        
        // Close modal and clear form data
        setEditModal({ isOpen: false, user: null });
        setEditFormData(null);
        
        // Refresh data
        setTimeout(() => {
          refetch();
        }, 100);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      showNotification(errorMessage, 'error');
    }
  };
  

  const handleDelete = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleConfirmDelete = async (userId: any) => {
    try {
      // Delete user from Supabase
      const { error, data } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        showNotification('Failed to delete user: ' + error.message, 'error');
      } else {
        showNotification('User deleted successfully!', 'success');
        setDeleteModal({ isOpen: false, user: null });
        refetch(); // reload users from Supabase
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      showNotification(errorMessage, 'error');
    }
  };

  // Notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>${message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Link to="/users/add">
          <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </Link>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{roleStats.admin}</div>
            <div className="text-xs sm:text-sm text-gray-600">City Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{roleStats.support_tech}</div>
            <div className="text-xs sm:text-sm text-gray-600">Support Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{roleStats.sales_marketing}</div>
            <div className="text-xs sm:text-sm text-gray-600">Sales & Marketing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{roleStats.accounting}</div>
            <div className="text-xs sm:text-sm text-gray-600">Accounting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{roleStats.logistics}</div>
            <div className="text-xs sm:text-sm text-gray-600">Logistics</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Org Admin</option>
              <option value="accounts">Accounts</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="city_head">City Head</option>
              <option value="support_tech">Support Tech</option>
              <option value="sales_marketing">Sales & Marketing</option>
              <option value="accounting">Accounting</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {['all', 'admin', 'accounts', 'sales', 'marketing', 'city_head', 'support_tech', 'sales_marketing', 'accounting', 'logistics'].map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors duration-200 ${filter === role
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {role === 'all' ? 'All Users' : role.replace('_', ' ')}
            <span className="ml-1 sm:ml-2 text-xs">
              {role === 'all' ? users.length : users.filter(u => u.role === role).length}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-1" />
                  Send Email
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              System Users ({filteredUsers.length})
            </h3>
            {/* <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Advanced Filter</span>
              </Button>
            </div> */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead className="hidden md:table-cell">Organization</TableHead>}
                <TableHead className="hidden md:table-cell">City</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center truncate">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="text-sm text-gray-500 md:hidden">
                          {user.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      <span className="hidden sm:inline">{user.role.replace('_', ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{user.role.split('_')[0].toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="hidden md:table-cell">
                      {user.organizationName ?? '—'}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">{user.city || 'N/A'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm flex items-center">
                      <span className="text-gray-500 mr-1">📞</span>
                      {user.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {user.last_login ? (
                      <div className="text-sm text-gray-900">
                        <div>{new Date(user.last_login).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.last_login).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" onClick={() => handleView(user)} />
                      </Button>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
                        <Edit className="h-4 w-4" onClick={() => handleUpdate(user)} />
                      </Button>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
                        <Trash2 className="h-4 w-4" onClick={() => handleDelete(user)} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ViewUserModal
        user={viewModal.user}
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, user: null })}
      />

      {/* 4. Pass editFormData and setEditFormData to EditUserModal, and update its props and usage */}
      <EditUserModal
        user={editFormData}
        isOpen={editModal.isOpen}
        onClose={() => { 
          setEditModal({ isOpen: false, user: null }); 
          setEditFormData(null); 
        }}
        onSave={handleSaveEdit}
        setFormData={setEditFormData}
      />

      <DeleteConfirmModal
        user={deleteModal.user}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};