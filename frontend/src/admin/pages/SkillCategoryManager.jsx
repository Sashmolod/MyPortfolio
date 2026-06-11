import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function SkillCategoryManager() {
  const [roots, setRoots] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: null,
    sortOrder: 0,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get('/admin/skill-categories'),
        api.get('/admin/skill-categories/flat'),
      ]);
      
      // Ensure data is always an array
      const treeData = Array.isArray(treeRes.data) ? treeRes.data : [];
      const flatData = Array.isArray(flatRes.data) ? flatRes.data : [];
      
      setRoots(treeData);
      setAllCategories(flatData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Не вдалося завантажити категорії');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat) => {
    if (!cat || !cat.id) {
      console.error('Invalid category object:', cat);
      return;
    }
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      parentId: cat.parentId != null && cat.parentId !== '' ? Number(cat.parentId) : null,
      sortOrder: cat.sortOrder ?? 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', parentId: null, sortOrder: 0 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleParentChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      parentId: value ? parseInt(value, 10) : null,
    }));
  };

  // Available parents for a given category (exclude the category itself and its descendants)
  const getAvailableParents = useCallback((excludeId) => {
    if (!excludeId) return allCategories;
    
    // Get all descendants of the category being edited
    const getDescendants = (categoryId, categories) => {
      const children = categories.filter(c => c.parentId === categoryId);
      let descendants = [...children];
      children.forEach(child => {
        descendants = descendants.concat(getDescendants(child.id, categories));
      });
      return descendants;
    };
    
    const descendants = getDescendants(excludeId, allCategories);
    const descendantIds = new Set(descendants.map(d => d.id));
    
    // Exclude the category itself and all its descendants
    return allCategories.filter((c) => c.id !== excludeId && !descendantIds.has(c.id));
  }, [allCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || formData.name.trim() === '') {
      setError('Назва категорії не може бути порожньою');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId !== null && formData.parentId !== '' ? Number(formData.parentId) : null,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (editingId) {
        await api.put(`/admin/skill-categories/${editingId}`, payload);
        setSuccess('Категорію оновлено');
      } else {
        await api.post('/admin/skill-categories', payload);
        setSuccess('Категорію створено');
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка збереження');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Видалити категорію "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/skill-categories/${id}`);
      setSuccess('Категорію видалено');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка видалення');
    }
  };

  // Get category name by ID (for debugging/display)
  const getCategoryName = (id) => {
    if (id == null) return '— Коренева —';
    const cat = allCategories.find(c => c.id === id);
    return cat ? cat.name : `#${id}`;
  };

  // Recursive CategoryNode component for tree rendering
  function CategoryNode({ category, depth = 0 }) {
    const children = category.subcategories || [];

    return (
      <>
        <div
          className="category-node"
          style={{ paddingLeft: `${depth * 24}px` }}
        >
          <div className="category-header">
            <span className="category-name">
              {depth > 0 ? '└─ ' : ''}{category.name}
            </span>
            <div className="category-actions">
              <button
                className="btn btn-sm"
                onClick={() => handleEdit(category)}
                title="Редагувати"
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(category.id, category.name)}
                title="Видалити"
              >
                🗑️
              </button>
            </div>
          </div>
          {children.length > 0 && (
            <div className="category-children">
              {children.map((child) => (
                <CategoryNode key={child.id} category={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  if (loading) {
    return <div className="admin-page">Завантаження категорій...</div>;
  }

  return (
    <div className="admin-page">
      <h2>📂 Категорії навичок</h2>

      {error && <div className="toast toast-error">{error}</div>}
      {success && <div className="toast toast-success">{success}</div>}

      {/* Add/Edit Form */}
      <div className="admin-card">
        <h3>{editingId ? '✏️ Редагувати' : '➕ Нова категорія'}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <label>Назва *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Наприклад: Frontend"
            />
          </div>
          <div className="admin-form-row">
            <label>Батьківська (порожньо = коренева)</label>
            <select
              name="parentId"
              value={formData.parentId ?? ''}
              onChange={handleParentChange}
            >
              <option value="">— Коренева категорія —</option>
              {getAvailableParents(editingId).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.parentId ? 1 : 0)}{cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label>Порядок сортування</label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Зберегти' : 'Створити'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={handleCancel}>
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories Tree */}
      <div className="admin-card">
        <h3>🌳 Дерево категорій</h3>
        {roots.length === 0 ? (
          <p>Категорій поки що немає</p>
        ) : (
          <div className="category-tree">
            {roots.map((root) => (
              <CategoryNode key={root.id} category={root} depth={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}