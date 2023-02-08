import React, { Component } from 'react'
import { View } from '@tarojs/components'
import { RegionPicker } from '../../components'
import './index.scss'

interface State {
  region: any[],
}

export default class Index extends Component<{}, State> {
  state: State = {
    region: ['北京', '北京市', '东城区'],
  }

  onGetRegion = (data) => {
    // let region = []
    if (data && data.length >= 3) {
      /// 将省市区的数据保存起来并刷新数据
      let region = [data[0].label, data[1].label, data[2].label]
      this.setState({ region })
    }
  }

  render() {
    let { region } = this.state
    return (
      <View className='index'>
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
      </View>
    )
  }
}
