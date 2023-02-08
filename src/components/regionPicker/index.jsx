
import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Picker, Text } from '@tarojs/components'
import regionData from './region'

export default class RegionPicker extends Component {
    state = {
        rangeTemp: [],
        valueTemp: [0, 0, 0],
    }

    componentWillMount() {
        ///第一次进入初始化省市区
        this.resetOriginData()
    }

    // 省市区选择器初始化
    resetOriginData = () => {
        let rangeTemp = []
        let provinceIndex = 0, cityIndex = 0, districtIndex = 0
        let provinceName, cityName, districtName
        var provinceData = [], cityData = [], districtData = []

        if (this.props.originData.length > 0) {
            provinceName = this.props.originData[0]
            if (this.props.originData.length > 1) {
                cityName = this.props.originData[1]
                if (this.props.originData.length > 2) {
                    districtName = this.props.originData[2]
                }
            }
        }
        /// 定位省
        for (let i = 0; i < regionData.length; i++) {
            /// 遍历并保存所有的省资料
            let province = regionData[i]
            provinceData.push(province)
            /// 省的名字匹配 如果匹配上了 则保存下标
            if (province.label === provinceName) {
                provinceIndex = i
            }
        }
        rangeTemp.push(provinceData)
        /// 定位市
        let temp = provinceData[provinceIndex]
        for (let i = 0; i < temp.children.length; i++) {
            let city = temp.children[i]
            cityData.push(city)
            if (city.label === cityName) {
                cityIndex = i
            }
        }
        rangeTemp.push(cityData)
        temp = cityData[cityIndex]
        /// 定位区
        for (let i = 0; i < temp.children.length; i++) {
            let district = temp.children[i]
            districtData.push(district)
            if (district.label === districtName) {
                districtIndex = i
            }
        }
        rangeTemp.push(districtData)
        let valueTemp = [provinceIndex, cityIndex, districtIndex]
        this.setState({
            rangeTemp,
            valueTemp
        })
    }



    // H5、微信小程序、百度小程序、字节跳动小程序
    onChange = (e) => {
        let rangeTemp = this.state.rangeTemp
        let valueTemp = e.detail.value
        /// 省
        let province = rangeTemp[0][valueTemp[0]]
        /// 市
        let city = province.children[valueTemp[1]]
        /// 区
        let district = city.children[valueTemp[2]]
        console.log(province.label + city.label + district.label)
        this.props.onGetRegion([province, city, district])
    }

    onColumnChange = (e) => {
        let { rangeTemp, valueTemp } = this.state
        let column = e.detail.column
        let row = e.detail.value
        valueTemp[column] = row
        switch (column) {
            case 0:
                let cityTemp = []
                let districtTemp = []
                for (let i = 0; i < regionData[row].children.length; i++) {
                    cityTemp.push(regionData[row].children[i])
                }
                for (let i = 0; i < regionData[row].children[0].children.length; i++) {
                    districtTemp.push(regionData[row].children[0].children[i])
                }
                valueTemp = [row, 0, 0]
                rangeTemp = [rangeTemp[0], cityTemp, districtTemp]
                break
            case 1:
                let districtTemp2 = []
                for (let i = 0; i < regionData[valueTemp[0]].children[row].children.length; i++) {
                    districtTemp2.push(regionData[valueTemp[0]].children[row].children[i])
                }
                valueTemp = [valueTemp[0], valueTemp[1], 0]
                rangeTemp = [rangeTemp[0], rangeTemp[1], districtTemp2]
                break
            case 2:
                break
        }
        this.setState({
            rangeTemp,
            valueTemp
        })
    }

    render() {
        let { rangeTemp, valueTemp } = this.state
        return (
            <View className='picker-wrap' onClick={() => this.resetOriginData()}>
                <Picker mode='multiSelector' onChange={this.onChange} onColumnChange={this.onColumnChange} value={valueTemp} rangeKey='label' range={rangeTemp}>
                    {this.props.children}
                </Picker>
            </View>
        )
    }
}

/// 设置默认值
RegionPicker.defaultProps = {
    // 外界传入默认数据 这个数据要么有3组数据，要么为空[]
    // 北京 北京市  东城区
    originData: []
}
