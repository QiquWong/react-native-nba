/**
 * Created by Cral-Gates on 2017/12/8.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    Platform,
    InteractionManager,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Clipboard
} from 'react-native';

import HeaderBar from '../components/headerBar';
import HtmlItem from '../components/htmlItem';
import CommonUtil from '../util/commonUtil';
import NetUtil from '../util/netUtil';
import CommonStyle from '../style/commonStyle';
import {getNavigator} from '../constant/router';
import Global from '../constant/global';
import Toast from '../components/toast';
import * as weChat from 'react-native-wechat';

const share = [
    {icon: require('../image/share/weixing.png'), name: '微信'},
    {icon: require('../image/share/penyouquan.png'), name: '朋友圈'},
    {icon: require('../image/share/qqhaoyou.png'), name: 'QQ'},
    {icon: require('../image/share/qqkongjian.png'), name: 'QQ空间'},
    {icon: require('../image/share/icon_link.png'), name: '复制链接'}];

class NewsDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detail: this.props.item,
            title: '新闻详情',
            shareUrl: this.props.item.item.url,
            animationType: 'slide',//none slide fade
            modalVisible: false,//模态场景是否可见
            transparent: true,//是否透明显示
            showModal: false
        };
    }

    componentDidMount() {
        weChat.registerApp('wx2fc24108d8c0cecd');
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType={this.state.animationType}
                    transparent={this.state.transparent}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this._onRequestClose()}>
                    <View style={styles.modal} onPress={() => this._closeModal()}>
                        <View style={{position: 'absolute', bottom: 0, backgroundColor: CommonStyle.BACKGROUND_COLOR}}>
                            <View style={styles.modalContent}>
                                {
                                    share.map((item, index) => this.renderShareItem(item, index))
                                }
                            </View>
                            <TouchableOpacity onPress={() => this._closeModal()}><View style={styles.modalCancel}><Text
                                style={styles.modalCancelTxt}>{'取消'}</Text></View></TouchableOpacity>
                        </View>

                    </View>
                </Modal>
                <HeaderBar
                    title={this.state.title}
                    showLeftState={true}
                    showRightState={true}
                    showRightImage={true}
                    leftItemTitle={''}
                    rightItemTitle={''}
                    leftImageSource={require('../image/back_left.png')}
                    rightImageSource={require('../image/share/share.png')}
                    onPress={() => this.goBack()}
                    onPressRight={() => this.showModal()}/>
                <ScrollView>
                    <View ><Text style={styles.title}>{this.props.item.item.title}</Text></View>
                    <HtmlItem
                        item={CommonUtil.isEmpty(this.state.detail.item.content) ? [] : this.state.detail.item.content}/>
                </ScrollView>
            </View>
        )
    }

    renderShareItem = (item, index) => {
        return (
            <TouchableOpacity onPress={() => this.share(index)} key={index}>
                <View style={styles.modalItem}>
                    <Image style={styles.shareImage} source={item.icon}/>
                    <Text style={styles.shareText}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    goBack = () => {
        getNavigator().pop();
    };

    showModal = () => {
        this.setState({
            modalVisible: true
        })
    };

    _closeModal = () => {
        this.setState({
            modalVisible: false
        })
    };

    _onRequestClose = () => {
        console.log('request');
    };

    share = (index) => {
        let platform = Platform.OS === 'ios' ? 'ios' : 'android';
        switch (index) {
            case 0:
                this.shareToSession();
                break;
            case 1:
                this.shareToTimeline();
                break;
            case 2:
                Toast.show('暂未开放');
                break;
            case 3:
                Toast.show('暂未开放');
                break;
            case 4:
                this.setToClipboard();
                break;
        }
        this._closeModal();
    };

    shareToSession = () => {
        weChat.isWXAppInstalled()
            .then(async (isInstalled) => {
                if (isInstalled) {
                    try {
                        let result = await weChat.shareToSession({
                            type: 'news',
                            title: this.state.detail.item.title,
                            description: this.state.detail.item.title,
                            thumbImage: Global.DEFAULT_LOGO,
                            webpageUrl: this.state.shareUrl
                        });
                    } catch (e) {
                        if (e instanceof weChat.WechatError) {
                            console.error(e.stack);
                        } else {
                            throw e;
                        }
                    }
                } else {
                    Toast.show('没有安装微信软件，请您安装微信之后再试');
                }
            });
    };

    shareToTimeline = () => {
        weChat.isWXAppInstalled()
            .then(async (isInstalled) => {
                if (isInstalled) {
                    try {
                        let result = await weChat.shareToTimeline({
                            type: 'news',
                            title: this.state.detail.item.title,
                            description: this.state.detail.item.title,
                            thumbImage: Global.DEFAULT_LOGO,
                            webpageUrl: this.state.shareUrl
                        });
                    } catch (e) {
                        if (e instanceof weChat.WechatError) {
                            console.error(e.stack);
                        } else {
                            throw e;
                        }
                    }
                } else {
                    Toast.show('没有安装微信软件，请您安装微信之后再试');
                }
            });
    };

    setToClipboard = () => {
        Clipboard.setString(this.state.shareUrl);
        Toast.show('已复制到剪贴板');
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        fontSize: 20,
        color: CommonStyle.BLACK,
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: CommonUtil.getScreenWidth(),
        height: CommonUtil.getScreenHeight()
    },
    modalContent: {
        flexDirection: 'row',
        width: CommonUtil.getScreenWidth(),
        height: CommonUtil.getScreenWidth() / 2 + 20,
        flexWrap: 'wrap',
        paddingTop: 10,
        paddingBottom: 10
    },
    modalItem: {
        height: CommonUtil.getScreenWidth() / 4,
        width: CommonUtil.getScreenWidth() / 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCancel: {
        height: 50,
        width: CommonUtil.getScreenWidth(),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: CommonStyle.GRAY_COLOR,
        borderTopWidth: 1
    },
    modalCancelTxt: {
        color: CommonStyle.THEME,
        fontSize: 18
    },
    shareImage: {
        height: 50,
        width: 50,
        marginBottom: 10
    },
    shareText: {
        fontSize: 14,
        color: CommonStyle.BLACK
    }
});

export default NewsDetail;