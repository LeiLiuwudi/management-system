/**
 * 患者信息展示弹框
 */

import React, { Component } from "react";
import { Form, Modal, Divider, Descriptions } from "antd";

class PatientsDescriptionForm extends Component {
  state = {};

  renderDescription() {
    const { currentRecord } = this.props;
    return (
      <div>
        <Descriptions title="患者信息">
          <Descriptions.Item label="患者姓名">
            {currentRecord.name}
          </Descriptions.Item>
          <Descriptions.Item label="患病类型">
            {currentRecord.disease}
          </Descriptions.Item>
          <Descriptions.Item label="患者编号">
            {currentRecord.medId}
          </Descriptions.Item>
          <Descriptions.Item label="患者性别">
            {currentRecord.gender === 1 ? "男" : "女"}
          </Descriptions.Item>
          <Descriptions.Item label="患者年龄">
            {currentRecord.age}
          </Descriptions.Item>
          <Descriptions.Item label="患者体重(kg)">
            {currentRecord.weight}
          </Descriptions.Item>
          <Descriptions.Item label="患者身高(cm)">
            {currentRecord.height}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="临床信息">
          <Descriptions.Item label="症状持续时间">
            三个月
            {/* {currentRecord.symptomTime} */}
          </Descriptions.Item>
          <Descriptions.Item label="现病史">
          现夜寐2至3小时，多汗，潮热，手足心热，背部冷，舌淡白，脉虚细无力，中药也吃了倆多月，不效
            {/* {currentRecord.presentIllnessHistory} */}
          </Descriptions.Item>
          <Descriptions.Item label="主诉">
          平素睡眠质量较差，睡眠时稍有声响很容易醒，偶尔入睡困难
            {/* {currentRecord.chiCom} */}
          </Descriptions.Item>
          <Descriptions.Item label="用药疗效">
          严重时口服谷维素，维生素B1等，效果理想，但易复发。
            {/* {currentRecord.treatmentHistory} */}
          </Descriptions.Item>
          <Descriptions.Item label="既往史">
          俩年前偶发失眠，经治疗给于安定，佐匹克隆，初效，后无效，伴随嘴唇颤抖
            {/* {currentRecord.pastHistory} */}
          </Descriptions.Item>
          <Descriptions.Item label="个人史">
            长期居住在杭州，无烟酒等不良嗜好
            {/* {currentRecord.personalHistory} */}
          </Descriptions.Item>  
          <Descriptions.Item label="家族史">
            无家族遗传病
            {/* {currentRecord.familyHistory} */}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }

  render() {
    console.log(this.props);
    const { currentRecord } = this.props;
    const title = `患者信息展示——${currentRecord.medId}_${currentRecord.name}`;
    return (
      <Modal
        visible={this.props.modalVisible}
        width="60%"
        title={title}
        onOk={() => {
          this.props.handleModalVisible(false, "patientsDescription");
        }}
        onCancel={() =>
          this.props.handleModalVisible(false, "patientsDescription")
        }
        destroyOnClose
      >
        {this.renderDescription()}
      </Modal>
    );
  }
}
export default Form.create()(PatientsDescriptionForm);
