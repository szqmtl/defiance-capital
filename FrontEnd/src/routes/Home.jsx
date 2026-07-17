import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotateRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Api from '../helpers/core/Api';
import ContentPanel from '../components/core/layout/ContentPanel';

const { Text } = Typography;

const initialFormValue = {
  type: 'expense',
  category: '',
  amount: null,
  date: dayjs(),
  description: ''
};

const Home = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);

    try {
      const params = { sorter: '-date' };
      if (selectedType !== 'all') params.type = selectedType;
      if (search) params.filter = search;

      const response = await Api.get('/transactions', { params });
      setItems(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedType, search]);

  const openCreateModal = () => {
    setEditingItem(null);
    form.setFieldsValue(initialFormValue);
    setIsModalOpen(true);
  };

  const openEditModal = record => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const submitTransaction = async values => {
    setSaving(true);

    try {
      const payload = {
        ...values,
        date: values.date.toISOString()
      };

      // Keep the save path explicit so the UI and API contract stay easy to follow.
      if (editingItem) {
        await Api.patch(`/transactions/${editingItem._id}`, payload);
      } else {
        await Api.post('/transactions', payload);
      }

      closeModal();
      await loadTransactions();
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async id => {
    await Api.delete(`/transactions/${id}`);
    await loadTransactions();
  };

  const summary = useMemo(() => {
    const income = items
      .filter(item => item.type === 'income')
      .reduce((total, item) => total + Number(item.amount || 0), 0);
    const expense = items
      .filter(item => item.type === 'expense')
      .reduce((total, item) => total + Number(item.amount || 0), 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [items]);

  const columns = [
    {
      title: t('common.type'),
      dataIndex: 'type',
      render: value => <Tag color={value === 'income' ? 'green' : 'red'}>{value}</Tag>
    },
    {
      title: t('common.category'),
      dataIndex: 'category'
    },
    {
      title: t('common.amount'),
      dataIndex: 'amount',
      render: value => Number(value).toFixed(2)
    },
    {
      title: t('common.date'),
      dataIndex: 'date',
      render: value => dayjs(value).format('YYYY-MM-DD')
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      render: value => <Text type="secondary">{value || '—'}</Text>
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>{t('common.edit')}</Button>
          <Button danger icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={() => deleteTransaction(record._id)} />
        </Space>
      )
    }
  ];

  return (
    <ContentPanel
      title="Daily Expense & Income Diary"
      subtitle="Track your daily transactions with a simple CRUD workflow."
      titleAction={
        <Space>
          <Button icon={<FontAwesomeIcon icon={faRotateRight} />} onClick={loadTransactions} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={openCreateModal}>
            {t('common.add')}
          </Button>
        </Space>
      }
      loading={false}
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Income" value={summary.income} precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Expense" value={summary.expense} precision={2} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Balance"
              value={summary.balance}
              precision={2}
              valueStyle={{ color: summary.balance >= 0 ? '#16a34a' : '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Space wrap>
          <Select
            value={selectedType}
            style={{ width: 180 }}
            onChange={value => setSelectedType(value)}
            options={[
              { value: 'all', label: 'All transactions' },
              { value: 'income', label: 'Income only' },
              { value: 'expense', label: 'Expense only' }
            ]}
          />
          <Input.Search
            allowClear
            placeholder="Filter by category or description"
            onSearch={value => setSearch(value)}
            style={{ width: 320 }}
          />
        </Space>
      </Card>

      <Card>
        <Table rowKey="_id" loading={loading} dataSource={items} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingItem ? 'Edit transaction' : 'New transaction'}
        open={isModalOpen}
        onCancel={closeModal}
        confirmLoading={saving}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={initialFormValue} onFinish={submitTransaction}>
          <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
            <Select options={[{ value: 'expense' }, { value: 'income' }]} />
          </Form.Item>
          <Form.Item name="category" label={t('common.category')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label={t('common.amount')} rules={[{ required: true }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="date" label={t('common.date')} rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </ContentPanel>
  );
};

export default Home;
