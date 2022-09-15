/*
 * @Author: lmk
 * @Date: 2021-07-19 22:38:14
 * @LastEditTime: 2022-09-07 15:19:42
 * @LastEditors: lmk
 * @Description: to extension
 */

import Web3 from "web3";
import { isMisesBrowser, urlToJson } from ".";

// import { signin } from "@/api/user";
import { Modal } from "antd-mobile";
export default class MisesExtensionController {
  web3: any;
  appid = "did:misesapp:mises1v49dju9vdqy09zx7hlsksf0u7ag5mj4579mtsk"; // prod
  timer:any;
  startNum = 10000;
  getMax = 10;
  getNum = 0;
  switchNetworkLoading = false;
  // appid = "did:misesapp:mises1g3atpp5nlrzgqkzd4qfuzrdfkn8vy0a4jepr2t"; // dev
  constructor() {
    
    setTimeout(() => this.getProvider, 10);
  }

  getProvider() {
    console.log(this.getNum, window.ethereum);
    if (this.getNum === this.getMax) {
      this.clear();
      // store.dispatch(setWeb3ProviderMaxFlag(false));
      return false;
    }
    if (window.ethereum && window.ethereum.chainId) {
      this.init();
      this.listen();
      this.clear();
      return false;
    }
    this.getNum++;
    this.timer = setTimeout(() => {
      this.getProvider();
    }, 500);
  }

  clear() {
    clearTimeout(this.timer);
    this.timer = null;
    this.startNum = 10000;
  }

  init() {
    if (!window.ethereum) {
      console.log("unInit");
      this.resetApp();
      return Promise.reject();
    }
    if (this.web3) {
      // store.dispatch(setWeb3Init(true));
      return Promise.resolve();
    }
    console.log("init");
    this.web3 = new Web3(window.ethereum || "ws://localhost:8545");
    this.web3.extend({
      property: "misesWeb3",
      methods: [
        {
          name: "requestAccounts",
          call: "mises_requestAccounts",
        },
        {
          name: "setUserInfo",
          call: "mises_setUserInfo",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "userFollow",
          call: "mises_userFollow",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "userUnFollow",
          call: "mises_userUnFollow",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "getMisesAccounts",
          call: "mises_getMisesAccount",
        },
        {
          name: "openRestore",
          call: "mises_openRestore",
        },
        {
          name: "openNFTPage",
          call: "mises_openNFTPage",
        },
        {
          name: "getActive",
          call: "mises_getActive",
        },
        {
          name: "connect",
          call: "mises_connect",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "disconnect",
          call: "mises_disconnect",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "getAddressToMisesId",
          call: "mises_getAddressToMisesId",
          params: 1,
          inputFormatter: [null],
        },
        {
          name: "getCollectibles",
          call: "mises_getCollectibles",
        },
      ],
    });
    // store.dispatch(setWeb3Init(true));

    // If the initialization is completed, the currently selected account will be obtained
    // setTimeout(() => {
    //   const {selectedAddress} = window.ethereum

    // }, 150);
    return Promise.resolve();
  }

  listen() {
    if (!window.ethereum) {
      return false;
    }
    window.ethereum.on("accountsChanged", async (res:string[]) => {
      if (res.length) {
        // store.dispatch(setWeb3AccountChanged(true));
        await this.resetAccount(res[0]);
        // store.dispatch(setWeb3AccountChanged(false));
      }
      // if(res.length===0) {
      //   this.resetApp()
      // }
    });
    window.ethereum.request({ method: "eth_accounts" }).then((res) => {
      if (res.length > 0) {
        this.resetAccount(res[0]);
        return false;
      }
      /**
       * @description: 
          Case 1: if the connected account list is empty and unlocked, it means that no account is connected to the website, and the existing local user data needs to be cleared

          Case 2: if the list of connected accounts in the locked state is empty, the existing local user data will not be processed
       */

      res.length === 0 &&
        this.isActive()
          .then((res) => {
            console.log("not find selectedAddress");
            this.resetApp();
          })
          .catch((err) => {
            console.log(err);
          });
    });
    window.ethereum.on("chainChanged", (res:string) => {
      console.log(res);
    });
    window.ethereum.on("unlocked", (res:boolean) => {
      console.log(res, "unlocked");
    });
  }

  resetApp() {
    // const { loginForm } = store.getState().user;
    const loginForm = {
      misesid:'',
      uid:''
    }
    if (loginForm.misesid) {
      console.log("resetApp");
      setTimeout(() => {
        // store.dispatch(setUserAuth(""));
        // store.dispatch(setUserToken(""));
        this.resetUser();
        // store.dispatch(setLoginForm({}));
        // localStorage.removeItem('discoverPageCache')
      }, 0);
    }
  }

  async resetAccount(res:string) {
    console.log("resetAccount");
    const misesid = await this.web3.misesWeb3.getAddressToMisesId(res);
    // const { loginForm } = store.getState().user;

    const loginForm = {
      misesid:'',
      uid:''
    }
    // If the selected user is different from the current user
    if (loginForm.misesid && loginForm.misesid.indexOf(misesid) === -1) {
      this.disconnect(loginForm.uid);
      this.resetUser();
    }
    return this.requestAccounts();
    // refreshByCacheKey(window.location.pathname)
    // this.connect(loginForm.misesid)
  }
  async isInitMetaMask(hideModal?:boolean) {
    if (!window.ethereum && !hideModal) {
      return this.isUnInitMetaMask();
    }
    if (window.ethereum && !window.ethereum.chainId && !hideModal) {
      return this.isUnInitMetaMask();
    }
    return window.ethereum && Boolean(window.ethereum.chainId)
      ? Promise.resolve(true)
      : !hideModal && this.isUnInitMetaMask();
  }

  isUnInitMetaMask() {
    //
    if (!isMisesBrowser()) {
      // store.dispatch(setVisibility(true));
      return false;
    }
    Modal.confirm({
      title: "Message",
      content: "Failed to connect with metamask, request to refresh again",
      onCancel: () => {},
      onConfirm: () => {
        window.location.reload();
      },
    });
    return Promise.resolve(false);
  }

  resetUser() {
    // store.dispatch(
    //   setFollowingBadge({
    //     total: 0,
    //     notifications_count: 0,
    //   })
    // );
    // refreshByCacheKey('/home')
    // clearCache();
    console.log("resetUser");
  }

  connect(userid:string) {
    return this.web3.misesWeb3.connect({
      domain: "mises.site", //
      appid: this.appid,
      userid,
      permissions: [],
    });
  }

  // getcollectibles
  getCollectibles() {
    return this.web3.misesWeb3.getCollectibles();
  }

  disconnect(userid:string) {
    console.log("disconnect");
    return this.web3.misesWeb3.disconnect({ appid: this.appid, userid });
  }

  async requestAccounts() {
    console.log("requestAccounts");
    try {
      const res = await this.getAuth();
      // const nonce = new Date().getTime();
      // const sign = res.mises_id+nonce;
      // await this.web3.eth.personal.sign(sign,res.accounts[0]) // show sign pop
      // store.dispatch(setUserAuth(res.auth));
      // const data = await signin({
      //   provider: "mises",
      //   user_authz: { auth: res.auth },
      // });
      // data.token && store.dispatch(setUserToken(data.token));
      return Promise.resolve();
    } catch (error:any) {
      if (error && error.code === 4001) {
        window.location.reload();
      }
      console.log(error);
      return Promise.reject(error);
    }
  }

  async getAuth() {
    console.log("getAuth");
    try {
      const flag = await this.isInitMetaMask();
      if (!flag) return Promise.reject();
      await this.init();
      const res = await this.web3.misesWeb3.requestAccounts();
      // const getCollectibles = await this.getCollectibles()
      // console.log(getCollectibles)
      const { mises_id } = urlToJson(`?${res.auth}`);
      await this.connect(mises_id);
      return {
        ...res,
        mises_id,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async setUserInfo(data:any) {
    console.log("setUserInfo");
    try {
      await this.isActive();
      await this.web3.misesWeb3.setUserInfo(data);
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async userFollow(data:any) {
    try {
      console.log("userFollow");
      const flag = await this.isInitMetaMask();
      if (!flag) return Promise.reject();
      await this.init();
      this.web3.misesWeb3.userFollow(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async userUnFollow(data:any) {
    try {
      console.log("userUnFollow");
      const flag = await this.isInitMetaMask();
      if (!flag) return Promise.reject();
      await this.init();
      this.web3.misesWeb3.userUnFollow(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async openRestore() {
    console.log("openRestore");
    const flag = await this.isInitMetaMask();
    if (!flag) return Promise.reject();
    await this.init();
    this.web3.misesWeb3.openRestore();
  }

  async getMisesAccounts(showModal:boolean) {
    console.log("getMisesAccounts");
    try {
      // const flag = await this.isInitMetaMask();
      // if(!flag) return Promise.reject()
      const flag = await this.isInitMetaMask(showModal);
      if (!flag) return Promise.reject();
      await this.init();
      const count = await this.web3.misesWeb3.getMisesAccounts();
      return count;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async isActive() {
    console.log("isActive");
    try {
      const flag = await this.isInitMetaMask();
      if (!flag) return Promise.reject();
      await this.init();
      const getActive = window.ethereum._state.isUnlocked;
      return getActive
        ? Promise.resolve(true)
        : Promise.reject("Wallet not activated");
    } catch (error) {
      console.log(error, "isActive");
      return Promise.reject(error || "Wallet not activated");
    }
  }

  async NFTPage() {
    const flag = await this.isInitMetaMask();
    if (!flag) return Promise.reject();
    await this.init();
    if(window.ethereum.chainId!=='0x1'){
      Modal.confirm({
        title: "Message",
        content: "Please switch to mainnet",
        onConfirm: () => {
          this.switchChianNetwork().then(()=>{
            setTimeout(() => {
              this.web3.misesWeb3.openNFTPage();
            }, 0);
          })
        },
      });
      return
    }
    this.web3.misesWeb3.openNFTPage();
  }

  switchChianNetwork() {
    return window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{
        chainId: "0x1",
      }],
    })
  }
}
