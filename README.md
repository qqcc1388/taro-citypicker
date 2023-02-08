# taro-citypicker
基于taro  Taro v3.3.0
运行命令 yarn run dev:weapp

小程序用到城市选择器，需要选择省市区，直接使用picker的mode='region'也可以实现，但是由于这个是微信自己封装的，没有暴露出数据源，这就导致与公司的省市区数据源不符合，出于这个原因，这里记录一下自定义省市区的步骤以及关键点
Demo效果图如下
<div style="text-align:left">
<img src="https://img2023.cnblogs.com/blog/950551/202302/950551-20230208134812603-1669846012.jpg" width="49%" height="49%">  
<img src="https://img2023.cnblogs.com/blog/950551/202302/950551-20230208134827621-1512086976.jpg" width="49%" height="49%">  
</div>

基本能实现
1、自定义省市区数据源
2、可以初始化默认省市区地址，当定位有变化是，支持选择最新的省市区地址
3、记录上次选择的省市区
4、传入省市区数组，如果在数据源中能查到该省市区，能够滚轴能自动定位到指定位置

项目需求是进入页面时获取一下当前定位，根据定位选择指定的省市区，如果没有定位，则默认选择北京-北京市-东城区
1、初始化页面，并让城市选择器选择北京-北京市-东城区
2、根据上一篇讲解的[小程序接高德地图sdk](https://www.cnblogs.com/qqcc1388/p/17079437.html)获取到的定位，重新设置城市选择器选择当前所在的省市区
```
  componentDidMount() {
    /// 获取精准定位
    myAmapFun.getRegeo({
      type: 'gcj02',
      success: (data) => {
        console.log(JSON.stringify(data))
        let { latitude,
          longitude, regeocodeData } = data[0]
        let { province, city, district } = regeocodeData.addressComponent
        ///初始化省市区
        let region = [province, city, district]
        this.setState({ latitude, longitude, region })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  }

  <View className='region-filter-wrap' >
    <RegionPicker onGetRegion={(e) => this.onGetRegion(e)} originData={region}>
      <View className='picker'>
        {
          region.map((item, index) => {
            return (
              <View className='item-button' key={index}>
                <View className='item-name'>{item}</View>
                <View className='item-arrow'></View>
              </View>
            )
          })
        }
      </View>
    </RegionPicker>
    {/* 城市选择器 微信原版，不能自定义数据源*/}
    {/* <Picker mode='region' level="city" value={region} onChange={(e) => this.onRegionPickerItemChange(e)}>
      <View className='picker'>
        {
          region.map((item, index) => {
            return (
              <View className='item-button' key={index}>
                <View className='item-name'>{item}</View>
                <View className='item-arrow'></View>
              </View>
            )
          })
        }
      </View>
    </Picker> */}
  </View>
```

上面用到的RegionPicker就是自定义组件了
其中有不少可以说的点
1、插槽的用法，在taro中插槽使用this.props.children的方式实现，当初在写的时候用slot各种尝试都无法生效
2、组件的省市区的实现使用的是picker的mode='multiSelector'来实现，需要组装好对应的数据
3、需要实现根据外部传入的省市区，到达组件时，根据传入的省区去定位到指定的行和列
```
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
```
4、当点击组件后，要能够重新刷新当前外部传入的省市区，由于picker没有点击事件的回调，这里就使用了一种取巧的方式，给picker的上级添加onclick事件，这样点击时去刷新picker的显示
```
<View className='picker-wrap' onClick={() => this.resetOriginData()}>
    <Picker mode='multiSelector' onChange={this.onChange} onColumnChange={this.onColumnChange} value={valueTemp} rangeKey='label' range={rangeTemp}>
        {this.props.children}
    </Picker>
</View>
```
5、点击后通过this.props.onGetRegion传递回调，传回选中的省市区对象
```
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
```
组件源码如下：
```
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
```
region.js 省市区资源文件太大，这里就不放了，这里只放一个北京的json样式
```
const cityData =
    [
        {
            label: "北京",
            value: 110000,
            children: [
                {
                    label: "北京市",
                    value: 110100,
                    children: [
                        {
                            label: "东城区",
                            value: 110101
                        },
                        {
                            label: "西城区",
                            value: 110102
                        },
                        {
                            label: "崇文区",
                            value: 110103
                        },
                        {
                            label: "宣武区",
                            value: 110104
                        },
                        {
                            label: "朝阳区",
                            value: 110105
                        },
                        {
                            label: "丰台区",
                            value: 110106
                        },
                        {
                            label: "石景山区",
                            value: 110107
                        },
                        {
                            label: "海淀区",
                            value: 110108
                        },
                        {
                            label: "门头沟区",
                            value: 110109
                        },
                        {
                            label: "房山区",
                            value: 110111
                        },
                        {
                            label: "通州区",
                            value: 110112
                        },
                        {
                            label: "顺义区",
                            value: 110113
                        },
                        {
                            label: "昌平区",
                            value: 110114
                        },
                        {
                            label: "大兴区",
                            value: 110115
                        },
                        {
                            label: "怀柔区",
                            value: 110116
                        },
                        {
                            label: "平谷区",
                            value: 110117
                        },
                        {
                            label: "密云县",
                            value: 110228
                        },
                        {
                            label: "延庆县",
                            value: 110229
                        },
                        {
                            label: "其它区",
                            value: 110230
                        }
                    ]
                }
            ]
        },
    ]
export default cityData
```
使用
```
tsx
<View className='region-filter-wrap' >
  <RegionPicker onGetRegion={(e) => this.onGetRegion(e)} originData={region}>
    <View className='picker'>
      {
        region.map((item, index) => {
          return (
            <View className='item-button' key={index}>
              <View className='item-name'>{item}</View>
              <View className='item-arrow'></View>
            </View>
          )
        })
      }
    </View>
  </RegionPicker>
</View>
onGetRegion = (data) => {
  // let region = []
  if (data && data.length >= 3) {
    /// 将省市区的数据保存起来并刷新数据
    let region = [data[0].label, data[1].label, data[2].label]
    this.setState({ region })
  }
}
scss
.region-filter-wrap {
  border-bottom: 1px solid #eee;
  .picker {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    .item-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #eee;
      .item-name {
        font-size: 26px;
        color: #333;
        font-weight: 500;
      }
      .item-arrow {
        margin-left: 20px;
        width: 0;
        height: 0;
        margin-top: 10px;
        border-width: 10px; /*控制箭头的大小 */
        border-style: solid;
        border-color: #333 transparent transparent transparent;
      }
    }
  }
}
```