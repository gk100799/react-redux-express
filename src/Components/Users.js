import React, { useState, useEffect } from 'react'
import { Button, Table, Input, InputNumber, Popconfirm, Form } from 'antd';
import './Users.css'
import { axiosInstance, request } from '../helpers'
import { connect } from 'react-redux'

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                    children
                )}
        </td>
    );
};

function Users({ users, deleteUser }) {

    // console.log(users);
    const [form] = Form.useForm();
    const [data, setData] = useState(users);
    const [editingKey, setEditingKey] = useState('');

    useEffect(() => {
        setData(users)
    }, [users])

    const isEditing = record => record._id === editingKey;

    const edit = record => {
        form.setFieldsValue({
            username: '',
            password: '',
            name: '',
            ...record,
        });
        setEditingKey(record._id);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async key => {
        try {
            const row = await form.validateFields();
            const req = {
                _id: key,
                name: row.name,
                username: row.username,
                password: row.password
            }
            axiosInstance.post('account/modify', req)
                .then(res => {
                    const newData = [...data];
                    const index = newData.findIndex(item => key === item._id);

                    if (index > -1) {
                        const item = newData[index];
                        newData.splice(index, 1, { ...item, ...row });
                        setData(newData);
                        setEditingKey('');
                    } else {
                        newData.push(row);
                        setData(newData);
                        setEditingKey('');
                    }
                })
            } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const handleConfirm = (_id) => {
        axiosInstance.post('account/delete', { _id: _id })
            .then(res => deleteUser(_id))
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            width: '20%',
            editable: true,
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            width: '25%',
            editable: true,
        },
        {
            title: 'Password',
            dataIndex: 'password',
            width: '20%',
            editable: true,
        },
        {
            title: 'Operations',
            width: '20%',
            dataIndex: 'operation',
            render: (_, record) => {
                // console.log(record)
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <a
                            // href="javascript:;"
                            onClick={() => save(record._id)}
                            style={{
                                marginRight: 8,
                            }}
                        >
                            Save
                        </a>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <a>Cancel</a>
                        </Popconfirm>
                    </span>
                ) : (
                        <>
                            <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                                Edit
                            </a>
                            <span style={{ whiteSpace: "pre" }}>                </span>
                            <Popconfirm title="Sure to delete?" onConfirm={() => handleConfirm(record._id)}>
                                <a>Delete</a>
                            </Popconfirm>
                        </>
                    );
            },
        },
        // {
        //     title: 'Delete',
        //     width: '20%',
        //     dataIndex: 'operation',
        //     render: (text, record) =>
        //         data.length >= 1 ? (
        //             <Popconfirm title="Sure to delete?" onConfirm={() => deleteUser(record._id)}>
        //                 <a>Delete</a>
        //             </Popconfirm>
        //         ) : null,
        // },
    ];

    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: record => ({
                record,
                // inputType: col.dataIndex === 'age' ? 'number' : 'text',
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    // const userList = users.length ? (
    //     users.map(user => {
    //         return (
    //             <div className="userList" key={user._id}>
    //                 <span onClick={() => { deleteUser(user._id) }}>{user.username}</span>
    //             </div>
    //         )
    //     })
    // ) : (
    //         <p className="noUsers">There are no Users to display!</p>
    //     )
    return (
        <div className="table">

            {/* {userList} */}
            <Form form={form} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
                    dataSource={data}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                // pagination={{
                //     onChange: cancel,
                // }}
                />
            </Form>
            {/* <br /> */}
            {/* <br /> */}
            {/* <div className="add-btn">
                <Button type="primary" shape="round" icon={<add />} size="large">
                    Add item
                </Button>    */}
            {/* </div> */}
        </div>
    )
}

const mapStateToProps = (state, otherProps) => {
    // console.log(state.users)
    return {
        users: state.users,
        otherProps
    }
}

export default connect(mapStateToProps)(Users);
