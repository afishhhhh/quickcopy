import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'

export default class Index extends Component {

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  config = {
    navigationBarTitleText: __APP_NAME
  }

  render () {
    return (
      <View className='index'>
        <Image className='img' src='/assets/icons/icon1.png' />
        <Image className='img' src='/assets/icons/icon2.png' />
        <View className='content'>{CONTENT}</View>
      </View>
    )
  }
}
