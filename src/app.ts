import { Component } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

class App extends Component {

  componentDidMount() {
    this.checkUpdate()
  }

  /**
   * 检查更新
   */
  checkUpdate = () => {
    if (Taro.canIUse('getUpdateManager')) {
      const updateManager = Taro.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(checkRes => {
        // 请求完新版本信息的回调
        if (checkRes.hasUpdate) {
          //检测到新版本，需要更新，给出提示
          Taro.showModal({
            title: '更新提示',
            content: '检测到新版本，是否下载新版本并重启小程序？',
            success: () => {
              this.downLoadAndUpdate(updateManager)
            }
          })
        }
      })
    } else {
      Taro.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }

  /**
   * 下载小程序新版本并重启应用
   */
  downLoadAndUpdate = (updateManager: Taro.UpdateManager) => {
    Taro.showLoading();
    //静默下载更新小程序新版本
    updateManager.onUpdateReady(function () {
      Taro.hideLoading()
      //新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      Taro.hideLoading()
      // 新的版本下载失败
      Taro.showModal({
        title: '已经有新版本了哟~',
        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
      })
    })
  }


  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children
  }
}

export default App
