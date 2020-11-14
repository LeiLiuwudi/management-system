import React, { Component } from "react";
import moment from "moment";
import { Input, Form, Select, DatePicker, Button, Steps, Message } from "antd";
import API from "../../api/api";
import { treatList, chineseMedicine } from "../../utils/medicalInfo";
import PicturesWall from "./pictureWall";
import _ from "lodash";

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

//将base64转换为blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
//将blob转换为file
function blobToFile(theBlob, fileName) {
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  return theBlob;
}

export default class RenderInfMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infCurrentStep: 0, // 近红外当前步骤
      infBeforeInfo: {
        infraBeforeFile: "", // 路径
        infraBeforeDesc: "", // 描述
        infraBeforeExcp: "", // 异常
        timeBefore: "", // 时间
        medicationBefore: "", // 用药情况
        chief: "", // 主诉
      },
      infMiddleInfo: {
        treat: [], // 治疗方案
        treatDetail: "", //治疗具体情况
        treatMedicine: [], // 治疗用药
        timeMiddle: "", //治疗时间
      },
      infAfterInfo: {
        infraAfterFile: "", // 路径
        infraAfterDesc: "", // 描述
        infraAfterExcp: "", // 异常
        timeAfter: "", // 时间
        medicationAfter: "", // 用药情况
      },
      fileInfoBefore: {}, // 治疗前上传的文件信息
      fileInfoAfter: {}, // 治疗后上传的文件信息
    };
  }

  // 更改近红外当前步骤
  handleInfStepChange = (current) => {
    this.setState({ infCurrentStep: current });
  };

  // 处理图片变化
  handleImageChange = async (fileInfo, process) => {
    console.log("fileInfo", fileInfo);
    let { file } = fileInfo;
    let fileUrl = await getBase64(file.originFileObj);

    // base64 转 file
    var blob = dataURLtoBlob(fileUrl);
    var fileMultiple = blobToFile(blob, "图片");
    console.log("fileMultiple", fileMultiple);

    // 本次治疗前
    if (process === "before") {
      let newInfBeforeInfo = this.state.infBeforeInfo;
      // newInfBeforeInfo.infraBeforeFile = fileUrl;
      newInfBeforeInfo.infraBeforeFile = file;

      this.setState({
        infBeforeInfo: newInfBeforeInfo,
        fileInfoBefore: fileInfo,
      });
    }
    // 本次治疗后
    if (process === "after") {
      let newInfAfterInfo = this.state.infAfterInfo;
      // newInfAfterInfo.infraAfterFile = fileUrl;
      newInfAfterInfo.infraAfterFile = file;
      this.setState({
        infAfterInfo: newInfAfterInfo,
        fileInfoAfter: fileInfo,
      });
    }
  };

  // 处理治疗前
  handleSaveBeforeTreat = async (values) => {
    let { infraDesc, infraExcp, medicine } = values;
    let newInfBeforeInfo = this.state.infBeforeInfo;
    newInfBeforeInfo.infraBeforeDesc = infraDesc;
    newInfBeforeInfo.infraBeforeExcp = infraExcp;
    newInfBeforeInfo.timeBefore = moment().format("YYYY-MM-DD HH:mm");
    newInfBeforeInfo.medicationBefore = medicine;
    await this.setState({
      infBeforeInfo: newInfBeforeInfo,
    });
    Message.success("保存成功！");
  };

  // 处理治疗中
  handleTreat = async (values) => {
    let { chineseMedicine, date, treat, treatDetail } = values;
    let newInfMiddleInfo = this.state.infMiddleInfo;
    newInfMiddleInfo.treat = treat;
    newInfMiddleInfo.treatMedicine = chineseMedicine;
    newInfMiddleInfo.timeMiddle = moment(date).format("YYYY-MM-DD HH:mm");
    newInfMiddleInfo.treatDetail = treatDetail;
    await this.setState({
      infMiddleInfo: newInfMiddleInfo,
    });
    Message.success("保存成功！");
  };

  // 处理治疗后
  handleSaveAfterTreat = async (values) => {
    let { infraDesc, infraExcp, medicine } = values;
    let newInfAfterInfo = this.state.infAfterInfo;
    newInfAfterInfo.infraAfterDesc = infraDesc;
    newInfAfterInfo.infraAfterExcp = infraExcp;
    newInfAfterInfo.timeAfter = moment().format("YYYY-MM-DD HH:mm");
    newInfAfterInfo.medicationAfter = medicine;
    await this.setState({
      infAfterInfo: newInfAfterInfo,
    });
    Message.success("保存成功！");
  };

  // todo 提交到后台
  handleSubmitInfInfo = () => {
    console.log("提交！");
    const { patientInfo } = this.props;
    let { infBeforeInfo, infMiddleInfo, infAfterInfo } = this.state;
    let param = {
      patientId: _.get(patientInfo, "id"),
      // createdAt: new Date(),
      medicalHistory: _.get(patientInfo, "medicalHistory"),
    };
    console.log("this.state.infBeforeInfo", this.state.infBeforeInfo);
    console.log("this.state.infMiddleInfo", this.state.infMiddleInfo);
    console.log("this.state.infAfterInfo", this.state.infAfterInfo);

    let handleInfMiddle = {};
    handleInfMiddle.timeMiddle = moment(infMiddleInfo.timeMiddle);
    handleInfMiddle.treatDetail = infMiddleInfo.treatDetail;
    handleInfMiddle.treat = infMiddleInfo.treat.join(",");
    handleInfMiddle.treatMedicine = infMiddleInfo.treatMedicine.join(",");

    Object.assign(param, infBeforeInfo, handleInfMiddle, infAfterInfo);
    let tBefore = param.timeBefore;
    let tAfter = param.timeAfter;

    param.timeBefore = moment(tBefore);
    param.timeAfter = moment(tAfter);

    // delete param.treatMedicine
    console.log("param", param);

    // const formData = new FormData();
    // for (let key in param) {
    //   formData.append(key, param[key]);
    // }

    // console.log("formData", formData);

    API.uploadRecord(param).then((res) => {
      console.log("res", res);
      if (res.code === "200") {
        Message.success("提交成功！");
      } else {
        Message.error(res.msg);
      }
    });

    this.props.handleInfImage({
      fileBefore: this.state.fileInfoBefore,
      fileAfter: this.state.fileInfoAfter,
    });
  };

  render() {
    const { patientInfo } = this.props;
    const layout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };

    return (
      <div style={{ paddingBottom: "30px" }}>
        <Steps
          current={this.state.infCurrentStep}
          onChange={this.handleInfStepChange}
        >
          <Step title="本次治疗前" />
          <Step title="本次治疗中" />
          <Step title="本次治疗后" />
        </Steps>
        <div
          style={{
            margin: "auto",
          }}
        >
          {this.state.infCurrentStep === 0 && (
            <div>
              <h2
                style={{
                  marginTop: "30px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {`上传 ${patientInfo.id}_${patientInfo.name} 本次治疗前的红外热像图及说明`}
              </h2>
              <Form
                {...layout}
                layout="horizontal"
                onFinish={this.handleSaveBeforeTreat}
                initialValues={{
                  infraDesc: this.state.infBeforeInfo.infraBeforeDesc,
                  infraExcp: this.state.infBeforeInfo.infraBeforeExcp,
                  medicine: this.state.infBeforeInfo.medicationBefore,
                  chief: this.state.infBeforeInfo.chief,
                }}
              >
                <div>
                  <Form.Item
                    label="红外热像"
                    className="imageFile"
                    name="infraFile"
                  >
                    <PicturesWall
                      handleImageChange={(fileUrl) =>
                        this.handleImageChange(fileUrl, "before")
                      }
                      fileInfo={this.state.fileInfoBefore}
                    />
                  </Form.Item>
                  <Form.Item
                    label="描述"
                    style={{ marginLeft: 0 }}
                    name="infraDesc"
                  >
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <Form.Item label="异常" name="infraExcp">
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <Form.Item label="用药情况" name="medicine">
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <Form.Item label="主诉" name="chief">
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <div
                    style={{
                      width: "200px",
                      display: "flex",
                      margin: "auto",
                    }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        flexGrow: 1,
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      type="primary"
                      style={{
                        flexGrow: 1,
                        marginLeft: "20px",
                      }}
                      onClick={() => {
                        this.setState({ infCurrentStep: 1 });
                      }}
                    >
                      下一步
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}
          {this.state.infCurrentStep === 1 && (
            <div>
              <h2
                style={{
                  marginTop: "30px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {`选择 ${patientInfo.id}_${patientInfo.name} 的本次方案`}
              </h2>
              <Form
                {...layout}
                className="treat"
                onFinish={this.handleTreat}
                initialValues={{
                  treat: this.state.infMiddleInfo.treat,
                  chineseMedicine: this.state.infMiddleInfo.treatMedicine,
                  date: this.state.infMiddleInfo.timeMiddle
                    ? moment(this.state.infMiddleInfo.timeMiddle)
                    : "",
                  treatDetail: this.state.infMiddleInfo.treatDetail,
                }}
              >
                <Form.Item label="选择治疗方案" name="treat">
                  <Select
                    mode="multiple"
                    showArrow="true"
                    placeholder="请选择治疗方案"
                    onChange={this.handleTreatChange}
                  >
                    {treatList.map((item, index) => {
                      return (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item label="选择药物配方" name="chineseMedicine">
                  <Select
                    mode="multiple"
                    showArrow="true"
                    placeholder="请选择药物配方"
                    onChange={this.handleTreatChange}
                  >
                    {chineseMedicine.map((item, index) => {
                      return (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item label="就诊时间" name="date">
                  <DatePicker placeholder="选择时间"></DatePicker>
                </Form.Item>
                <Form.Item label="治疗情况说明" name="treatDetail">
                  <TextArea
                    style={{ height: 32 }}
                    autoSize={{ minRows: 4, maxRows: 10 }}
                    placeholder="请输入..."
                  />
                </Form.Item>
                <div
                  style={{
                    width: "300px",
                    display: "flex",
                    margin: "auto",
                  }}
                >
                  <Button
                    type="primary"
                    style={{
                      flexGrow: 1,
                      marginRight: "20px",
                    }}
                    onClick={() => {
                      this.setState({ infCurrentStep: 0 });
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      flexGrow: 1,
                    }}
                  >
                    保存
                  </Button>
                  <Button
                    type="primary"
                    style={{
                      flexGrow: 1,
                      marginLeft: "20px",
                    }}
                    onClick={() => {
                      this.setState({ infCurrentStep: 2 });
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Form>
            </div>
          )}
          {this.state.infCurrentStep === 2 && (
            <div>
              <h2
                style={{
                  marginTop: "30px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {`上传 ${patientInfo.id}_${patientInfo.name} 本次治疗后的红外热像图及说明`}
              </h2>
              <Form
                {...layout}
                layout="horizontal"
                onFinish={this.handleSaveAfterTreat}
                initialValues={{
                  infraDesc: this.state.infAfterInfo.infraAfterDesc,
                  infraExcp: this.state.infAfterInfo.infraAfterExcp,
                  medicine: this.state.infAfterInfo.medicationAfter,
                }}
              >
                <div>
                  <Form.Item
                    label="红外热像"
                    className="imageFile"
                    name="infraFile"
                  >
                    <PicturesWall
                      handleImageChange={(fileUrl) =>
                        this.handleImageChange(fileUrl, "after")
                      }
                      fileInfo={this.state.fileInfoAfter}
                    />
                  </Form.Item>
                  <Form.Item
                    label="描述"
                    style={{ marginLeft: 0 }}
                    name="infraDesc"
                  >
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <Form.Item label="异常" name="infraExcp">
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>
                  <Form.Item label="用药情况" name="medicine">
                    <TextArea
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      placeholder="请输入..."
                    />
                  </Form.Item>

                  <div
                    style={{
                      width: "300px",
                      display: "flex",
                      margin: "auto",
                    }}
                  >
                    <Button
                      type="primary"
                      style={{
                        flexGrow: 1,
                        marginRight: "20px",
                      }}
                      onClick={() => {
                        this.setState({ infCurrentStep: 1 });
                      }}
                    >
                      上一步
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        flexGrow: 1,
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      type="primary"
                      style={{
                        flexGrow: 1,
                        marginLeft: "20px",
                      }}
                      onClick={this.handleSubmitInfInfo}
                    >
                      确认提交
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    );
  }
}
