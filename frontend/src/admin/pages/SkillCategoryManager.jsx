import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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

  const fetchCategories = useCallback(async () => {
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get('/admin/skill-categories'),
        api.get('/admin/skill-categories/flat'),
      ]);

      const treeData = Array.isArray(treeRes.data) ? treeRes.data : [];
      const flatData = Array.isArray(flatRes.data) ? flatRes.data : [];

      setRoots(treeData);
      setAllCategories(flatData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      window.toast?.('Не удалось загрузить категории / Failed to load categories', 'error');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const getAvailableParents = useCallback((excludeId) => {
    if (!excludeId) return allCategories;

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

    return allCategories.filter((c) => c.id !== excludeId && !descendantIds.has(c.id));
  }, [allCategories]);

  const getCategoryDepth = useCallback((cat, flatList) => {
    let depth = 0;
    let current = cat;
    while (current && current.parentId) {
      depth++;
      current = flatList.find(c => c.id === current.parentId);
    }
    return depth;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      window.toast?.('Название категории не может быть пустым / Category name cannot be empty', 'error');
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
        window.toast?.('Категория обновлена / Category updated', 'success');
      } else {
        await api.post('/admin/skill-categories', payload);
        window.toast?.('Категория создана / Category created', 'success');
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Ошибка сохранения / Error saving';
      window.toast?.(errMsg, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить категорию "${name}"? / Delete category "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/skill-categories/${id}`);
      window.toast?.('Категория удалена / Category deleted', 'success');
      fetchCategories();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Ошибка удаления / Error deleting';
      window.toast?.(errMsg, 'error');
    }
  };

  function CategoryNode({ category, depth = 0 }) {
    const children = category.subcategories || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            margin: '6px 0',
            background: 'var(--card-bg)',
            border: 'var(--border-style)',
            borderRadius: 'var(--sketch-radius-3)',
            boxShadow: '2px 2px 0px var(--border-color)',
            marginLeft: `${depth * 20}px`,
            position: 'relative',
            gap: '12px',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          whileHover={{
            transform: 'translate(-2px, -2px)',
            boxShadow: '4px 4px 0px var(--border-color)',
          }}
        >
          {/* Node label and icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', userSelect: 'none' }}>
              {depth === 0 ? '📁' : children.length > 0 ? '📂' : '📄'}
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
              {category.name}
            </strong>
            <span style={{ fontSize: '11px', opacity: 0.5, fontFamily: "'Architects Daughter', cursive" }}>
              (Сорт: {category.sortOrder})
            </span>
          </div>

          {/* Node actions */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className="btn"
              onClick={() => handleEdit(category)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                boxShadow: '1px 1px 0px var(--border-color)',
                marginBottom: 0
              }}
              title="Редактировать / Edit"
            >
              ✏️
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(category.id, category.name)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                boxShadow: '1px 1px 0px var(--border-color)',
                marginBottom: 0
              }}
              title="Удалить / Delete"
            >
              🗑️
            </button>
          </div>
        </motion.div>

        {children.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {children.map((child) => (
              <CategoryNode key={child.id} category={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '18px', fontFamily: "'Architects Daughter', cursive" }}>
        Загрузка категорий... / Loading categories...
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0' }}>
      <h2 style={{
        fontFamily: "'Architects Daughter', cursive",
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '10px',
        marginBottom: '24px',
        fontSize: '1.8rem',
        color: 'var(--accent)',
      }}>
        📂 Категории навыков / Skill Categories
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Column 1: Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: "'Architects Daughter', cursive",
            marginBottom: '20px',
            fontSize: '1.4rem'
          }}>
            {editingId ? '✏️ Редактировать категорию / Edit Category' : '➕ Новая категория / New Category'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>
                Название * / Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Например: Frontend"
                style={{ marginBottom: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>
                Родительская категория / Parent Category
              </label>
              <select
                name="parentId"
                value={formData.parentId ?? ''}
                onChange={handleParentChange}
                style={{ marginBottom: '12px', cursor: 'pointer' }}
              >
                <option value="">— Корневая категория (нет родителя) —</option>
                {getAvailableParents(editingId).map((cat) => {
                  const depth = getCategoryDepth(cat, allCategories);
                  return (
                    <option key={cat.id} value={cat.id}>
                      {'\u00A0\u00A0'.repeat(depth)}{depth > 0 ? '└─ ' : ''}{cat.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>
                Порядок сортировки / Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min="0"
                style={{ marginBottom: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn" style={{ flex: 1, padding: '10px 16px' }}>
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-danger" onClick={handleCancel} style={{ flex: 1, padding: '10px 16px' }}>
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Column 2: Tree */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: "'Architects Daughter', cursive",
            marginBottom: '20px',
            fontSize: '1.4rem'
          }}>
            🌳 Дерево категорий / Category Tree
          </h3>
          {roots.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Категорий пока нет / No categories yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {roots.map((root) => (
                <CategoryNode key={root.id} category={root} depth={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}