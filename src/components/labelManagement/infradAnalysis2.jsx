import React, { Component, Fragment } from "react";
import "./label-information-management.less";
// import { Line, Bar } from "echarts-for-react";
import { getAge, formatDate } from "../../utils/dateUtils";
import { Link } from "react-router-dom";
import ReactEcharts from 'echarts-for-react'
import {
  Row,
  DatePicker,
  Button,
  Card,
  Table,
  Icon,
  Form,
  Input,
  Tabs,
  Tag,
  Divider,
  Tooltip,
  Select,
  Message
} from "antd";
import moment from "moment";
import API from "../../api/algorithm";
import CollectInformationDisplay from "../Modals/CollectInformationDisplay";
import DataAssociationForm from "../Modals/DataAssociationForm";
import TaskInformationCollection from "../Modals/TaskInformationCollection";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const initTime = [moment().subtract(7, "days"), moment().subtract(1, "days")];

class infradAnalysis2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: initTime,
      CollectInformationModalVisible: false, // 采集信息展示弹框是否可见
      DataAssociationFormModalVisible: false, // 数据关联弹框是否可见
      taskInformationCollectionVisible: false, // 更新任务弹框是否可见
      modalVisible2: false, // 任务采集信息表单
      modalVisible3: false, // 临床信息采集表单
      modalVisible4: false, // 采集信息总体描述
      modalVisible5: false, // 采集数据存储关联
      edit: false,
      currentRecordId: -1,
      currentUserName: "undefined",
      currentRecord: undefined,
      tableData: [],
      doctorList: [], // 医生数据
      diseaseList: [], // 疾病列表
      barData: []
    };
  }

  componentDidMount() {
    // 获取标注统计结果
    API.getTaskTotal({}).then(res=>{
      var items = [];
      var date = "";
      var strDay = "";
      for (var i=0;i<30;i++){
        strDay = (i+1).toString()
        if (strDay.length===1){
            strDay = "0"+strDay;
        }
       date = "2019-11-" + strDay;
       items.push({时间:date,wcst任务:res.data.wcst[strDay],整晚任务:res.data.nir[strDay]})
      }
      console.log(res.data)
      this.setState({
        barData:items
      });
      
    });
    // 获取患者任务列表
    API.getTaskList({}).then(res => {
      this.getTableDate(res);
    });

    // 获取医生列表
    API.getDoctorList({}).then(res => {
      let newDoctorList = [];
      res.data.map((item, index) => {
        newDoctorList.push(item);
      });
      this.setState({
        doctorList: newDoctorList
      });
    });

    // 获取疾病列表
    API.getDiseaseList({}).then(res => {
      this.setState({
        diseaseList: res.data
      });
    });
  }

  // 设置柱状图格式
  getBarOption = (data) => {
    return{
    title: {
      "text": "本月任务标注数量柱状图"
    },
    legend: {},
    tooltip: {},
    dataset: {
        dimensions: ['时间', 'wcst任务', '整晚任务'],
        source: this.state.barData
    },
    xAxis: {type: 'category'},
    yAxis: {},
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [
        {type: 'bar'},
        {type: 'bar'},
    ]
   } 
  };


  // 处理表格数据
  getTableDate = res => {
    let newTableData = [];
    res.data.map((item, index) => {
      let newTableDataItem = {};
      newTableDataItem.name = item.patient.name;
      newTableDataItem.medId = item.patient.medId;
      newTableDataItem.gender = item.patient.gender;
      newTableDataItem.age = getAge(item.patient.birthday);
      newTableDataItem.disease = item.patient.disease;
      newTableDataItem.doctorName = item.patient.doctorName;
      newTableDataItem.testTime = item.task.time;
      newTableDataItem.testType = item.type === 0 ? "WCST" : "整晚";
      Object.assign(item, newTableDataItem);
      item.key = index;
      newTableData.push(item);
    });
    this.setState({
      tableData: newTableData
    });
  };

  // 处理查询提交
  handleSearchSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let param = {
          medId: values.patientID ? values.patientID : undefined,
          name: values.patientName ? values.patientName : undefined,
          doctorId: values.doctorId ? values.doctorId : undefined,
          disease: values.diseaseType ? values.diseaseType : undefined
        };
        if (values.date) {
          param.startTime = formatDate(values.date[0]);
          param.endTime = formatDate(values.date[1]);
        } 
        API.getTaskList(param).then(res => {
          this.getTableDate(res);
        });
      }
    });
  };
  //重置查询条件
  handleReset = () => {
    this.props.form.resetFields();
    API.getTaskList({}).then(res => {
      this.getTableDate(res);
    });
    this.setState({
      date: ""
    });
  };

  //用于显示新建标注页面
  handleModalVisible = (flag, msg) => {
    if (msg === "description") {
      this.setState({
        edit: false,
        CollectInformationModalVisible: flag
      });
    }
    if (msg === "dataPath") {
      this.setState({
        edit: false,
        DataAssociationFormModalVisible: flag
      });
    }
    if (msg === "taskInfo") {
      this.setState({
        edit: false,
        taskInformationCollectionVisible: flag
      });
    }
  };
  //表格上点击操作编辑按钮是直接将id数据传送
  handleClick = (flag, record, msg) => {
    if (msg === "description") {
      this.setState({
        edit: true,
        CollectInformationModalVisible: flag,
        // currentRecordId: record.medId,
        // currentUserName: record.name,
        currentRecord: record
      });
    }
    if (msg === "dataPath") {
      this.setState({
        edit: true,
        DataAssociationFormModalVisible: flag,
        currentRecord: record
      });
    }
    if (msg === "taskInfo") {
      this.setState({
        edit: true,
        taskInformationCollectionVisible: flag,
        currentRecord: record
      });
    }
  };

  deleteTask = (record) => {
    console.log(record)
    // 删除患者WCST任务
    if(record.type===0){
      API.removeWcstTask({id: record.task.id}).then(res=>{
        console.log(res)
        Message.success('WCST任务删除成功！')
        API.getTaskList({}).then(res => {
          this.getTableDate(res);
        });
      })
    }else if(record.type===1){
      // 删除近红外数据（睡眠测试整晚）
      API.removeTask({id: record.task.id}).then(res=>{
        console.log(res)
        Message.success('近红外任务删除成功！')
        API.getTaskList({}).then(res => {
          this.getTableDate(res);
        });
      })
    }
    API.getTaskTotal({}).then(res=>{
      var items = [];
      var date = "";
      var strDay = "";
      for (var i=0;i<30;i++){
        strDay = (i+1).toString()
        if (strDay.length===1){
            strDay = "0"+strDay;
        }
       date = "2019-11-" + strDay;
       items.push({时间:date,wcst任务:res.data.wcst[strDay],整晚任务:res.data.nir[strDay]})
      }
   
      this.setState({
        barData:items
      });
    });
  };

  //查询表单
  renderSearch() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" onSubmit={this.handleSearchSubmit}>
        <Form.Item>
          {getFieldDecorator(
            "patientID",
            {}
          )(
            <Input
              style={{ width: 200 }}
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="患者编号"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(
            "patientName",
            {}
          )(
            <Input
              style={{ width: 200 }}
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="患者姓名"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(
            "doctorId",
            {}
          )(
            <Select
              allowClear={true}
              showSearch
              style={{ width: 200 }}
              placeholder="选择医生"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.state.doctorList.map((item, index) => (
                <Option value={item.id} key={index}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(
            "diseaseType",
            {}
          )(
            <Select
              allowClear={true}
              showSearch
              style={{ width: 200 }}
              placeholder="选择失眠类型"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.state.diseaseList.map((item, index) => (
                <Option value={item.id} key={index}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(
            "date",
            {}
          )(
            <RangePicker
              style={{ width: 200 }}
              placeholder={["开始日期", "结束日期"]}
              ranges={{
                Today: [moment(), moment()],
                "This Month": [
                  moment().startOf("month"),
                  moment().endOf("month")
                ]
              }}
            />
          )}
        </Form.Item>
        <Form.Item>
        <Button type="primary" htmlType="submit">
            新建测试信息
          </Button>
          <Button type="primary" htmlType="submit">
            查询测试信息
          </Button>
          <Button style={{ marginLeft: "20px" }} onClick={this.handleReset}>
            重置
          </Button>
        </Form.Item>
      </Form>
    );
  }
  columns = [
    {
      title: "患者姓名",
      dataIndex: "name",
      width: "7%"
    },
    {
      title: "唯一编号",
      dataIndex: "medId",
      width: "7%"
    },
    {
      title: "患者性别",
      dataIndex: "gender",
      width: "7%",
      render: text => {
        const gender = [
          { label: 0, value: "女" },
          { label: 1, value: "男" }
        ];
        const item = gender.find(v => v.label === text);
        if (item) {
          return <Tag color="red">{item.value}</Tag>;
        }
      }
    },
    {
      title: "患者年龄",
      dataIndex: "age",
      width: "7%"
    },
    {
      title: "患病类型",
      dataIndex: "disease",
      width: "7%",
      render: text => {
        const item = this.state.diseaseList.find(v => v.name === text);
        if (!item) {
          return <Tag color="#2db7f5">{"未诊断"}</Tag>;
        } else {
          return <Tag color="#2db7f5">{"退行性变化"}</Tag>;
        }
      }
    },
    {
      title: "主治医生",
      dataIndex: "doctorName",
      width: "10%"
    },
    {
      title: "测试时间",
      dataIndex: "testTime",
      width: "10%"
    },
    // {
    //   title: "任务类型",
    //   dataIndex: "testType",
    //   width: "10%"
    // },
    {
      title: "操作",
      width: "15%",
      render: (text, record) => {
        return (
          <div>
                <Link to="/Assist2">
                <Button  type="primary">上传热像</Button>
                </Link>
                <Button  type="primary">查看热像</Button>
                <Button  type="primary">智能分析</Button>
              {/* <Tooltip title="上传热像">
                <span
                  //onClick={() => this.handleClick(true, record, "description")}
                  style={{ cursor: "pointer" }}
                >
                  <Icon type="edit" />
                  <span style={{ marginLeft: "5px" }}>上传热像</span>
                </span>
              </Tooltip> */}
              {/* <Tooltip title="查看热像">
                <span
                  //onClick={() => this.handleClick(true, record, "description")}
                  style={{ cursor: "pointer" }}
                >
                  <Icon type="edit" />
                  <span style={{ marginLeft: "5px" }}>查看热像</span>
                </span>
              </Tooltip>
              <Tooltip title="智能分析">
                <span
                  //onClick={() => this.handleClick(true, record, "description")}
                  style={{ cursor: "pointer" }}
                >
                  <Icon type="edit" />
                  <span style={{ marginLeft: "5px" }}>智能分析</span>
                </span>
              </Tooltip> */}
           
          </div>
        );
      }
    },
    // {
    //   title: "添加/修改采集信息",
    //   width: "30%",
    //   render: (text, record) => {
    //     return (
    //       <Fragment>
    //         <Tooltip title="数据存储关联">
    //           <span
    //             onClick={() => this.handleClick(true, record, "dataPath")}
    //             style={{ cursor: "pointer" }}
    //           >
    //             <Icon type="dropbox" />
    //             <span style={{ marginLeft: "5px" }}>数据存储关联</span>
    //           </span>
    //         </Tooltip>
    //         {record.testType === "WCST" && (
    //           <Fragment>
    //             <Divider type="vertical" />
    //             <Tooltip title="任务测试信息">
    //               <span
    //                 onClick={() => this.handleClick(true, record, "taskInfo")}
    //                 style={{ cursor: "pointer" }}
    //               >
    //                 <Icon type="apple" />
    //                 <span style={{ marginLeft: "5px" }}>更新任务测试信息</span>
    //               </span>
    //             </Tooltip>
    //           </Fragment>
    //         )}
    //         <Divider type="vertical" />
    //         <Tooltip title="删除此条任务">
    //           <span
    //             onClick={() => this.deleteTask(record)}
    //             style={{ cursor: "pointer" }}
    //           >
    //             <Icon type="delete" />
    //             <span style={{ marginLeft: "5px" }}>删除</span>
    //           </span>
    //         </Tooltip>
    //       </Fragment>
    //     );
    //   }
    // }
  ];
  render() {
    return (
      <div className="main-content">
        {this.renderSearch()}
        
        <Table
          style={{ marginTop: "24px" }}
          bordered
          columns={this.columns}
          dataSource={this.state.tableData}
        />
        {/* 采集信息展示弹框 */}
        {this.state.CollectInformationModalVisible && (
          <CollectInformationDisplay
            modalVisible={this.state.CollectInformationModalVisible}
            handleModalVisible={this.handleModalVisible}
            currentRecordId={this.state.currentRecordId}
            currentUserName={this.state.currentUserName}
            currentRecord={this.state.currentRecord}
          />
        )}
        {/* 数据关联弹框 */}
        {this.state.DataAssociationFormModalVisible && (
          <DataAssociationForm
            modalVisible={this.state.DataAssociationFormModalVisible}
            handleModalVisible={this.handleModalVisible}
            currentRecord={this.state.currentRecord}
          />
        )}
        {/* 更新任务弹框 */}
        {this.state.taskInformationCollectionVisible && (
          <TaskInformationCollection
            modalVisible={this.state.taskInformationCollectionVisible}
            handleModalVisible={this.handleModalVisible}
            currentRecord={this.state.currentRecord}
            getTableDate={this.getTableDate}
          />
        )}
      </div>
    );
  }
}

export default Form.create()(infradAnalysis2);
