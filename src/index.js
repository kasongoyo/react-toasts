import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import WatchableStore from 'watchable-stores';
import PropType from 'prop-types';
import styled, { keyframes } from 'styled-components';

const FadeInUp = keyframes`
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
`;

const Toasts = styled.div`
  position: absolute;
  overflow: hidden;
  z-index: 9999;
  max-height: calc(100vh - 10px);
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Toast = styled.div`
  font-family: 'Arial';
  display: flex;
  align-items: center;
  text-align: center;
  padding: 5px 15px;
  white-space: pre-line;
  min-height: 50px;
  margin-bottom: 15px;
  border-radius: 5px;
  animation-name: ${FadeInUp};
  animation-duration: 1s;
  animation-fill-mode: both;
`;

const BackgroundColor = {
  success: {
    backgroundColor: "rgba(46, 204, 113, 1)"
  },
  info: {
    backgroundColor: "rgba(236, 240, 241, 1)"
  },
  warning: {
    backgroundColor: "rgba(241, 196, 15, 1)"
  },
  error: {
    backgroundColor: "rgba(231, 76, 60, 1)"
  }
};

const LightBackgroundColor = {
  success: {
    color: '#468847',
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
  },
  info: {
    color: '#3a87ad',
    backgroundColor: '#d9edf7',
    borderColor: '#bce8f1',
  },
  warning: {
    color: '#c09853',
    backgroundColor: '#fcf8e3',
    borderColor: '#fbeed5',
  },
  error: {
    color: '#b94a48',
    backgroundColor: '#f2dede',
    borderColor: '#eed3d7',
  }
}

const Store = () => {
  const store = WatchableStore({
    action: '',
    message: ''
  });

  ['success', 'info', 'warning', 'error'].forEach(status => {
    store[status] = (message, timer, classNames) => {
      store.data = {
        status,
        message,
        timer,
        classNames
      };
    };
  });

  return store;
};

class Container extends Component {
  static POSITION = {
    TOP_LEFT: "top_left",
    TOP_RIGHT: "top_right",
    BOTTOM_LEFT: "bottom_left",
    BOTTOM_RIGHT: "bottom_right",
    TOP_CENTER: "top_center",
    BOTTOM_CENTER: "bottom_center",
  };

  constructor(props) {
    super(props);

    this.state = {
      styles: {},
      toasts: []
    };
  }

  componentDidMount() {
    this.storeSubscription = this.props.store.watch(data => {
      let toast = Object.assign({}, { ...data, id: Math.random() });
      this.setState({ toasts: [toast].concat(this.state.toasts) });
      setTimeout(() => {
        this.setState({ toasts: this.state.toasts.filter(t => t.id !== toast.id) });
      }, data.timer || 3000);
    });

    let styles = {};
    switch (this.props.position) {
      case Container.POSITION.TOP_LEFT:
        styles.top = 10;
        styles.left = 10;
        break;
      case Container.POSITION.TOP_RIGHT:
        styles.top = 10;
        styles.right = 10;
        break;
      case Container.POSITION.TOP_CENTER:
        styles.top = 10;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case Container.POSITION.BOTTOM_LEFT:
        styles.bottom = 10;
        styles.left = 10;
        break;
      case Container.POSITION.BOTTOM_RIGHT:
        styles.bottom = 10;
        styles.right = 10;
        break;
      case Container.POSITION.BOTTOM_CENTER:
        styles.bottom = 10;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      default:
        styles.bottom = 10;
        styles.right = 10;
        break;
    }
    this.setState({ styles: styles });
  }

  componentWillUnmount() {
    this.props.store.unwatch(this.storeSubscription);
  }

  _renderContainer() {
    const style = this.props.lightBackground ? LightBackgroundColor : BackgroundColor;
    return (
      <Toasts style={this.state.styles}>
        {
          this.state.toasts.map(toast => {
            return (
              <Toast
                key={toast.id}
                className={'toast toast-' + toast.status + ' ' + toast.classNames}
                style={style[toast.status]}
              >
                {toast.message}
              </Toast>
            );
          })
        }
      </Toasts>
    );
  }

  render() {
    return ReactDOM.createPortal(
      this._renderContainer(),
      document.body
    );
  }
}

Container.propTypes = {
  store: PropType.object.isRequired,
  position: PropType.string
};

export const ToastStore = Store();
export const ToastContainer = Container;
