<template>
    <div>
      <nav-header></nav-header>
      <div class="container">
        <div class="page-title-normal">
          <h2 class="page-title-h2"><span>购买成功！</span></h2>
        </div>
        <!-- 进度条 -->
        <div class="check-step">
          <ul>
            <li class="cur">确认地址</li>
            <li class="cur">查看订单</li>
            <li class="cur">完成支付</li>
            <li class="cur">购买成功</li>
          </ul>
        </div>

        <div class="order-create">
          <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
          <div class="order-create-main">
            <h3>下单成功！</h3>
            <p>
              <span>订单号：{{orderId}}</span>
              <span>订单价格：{{orderTotal|currency('￥')}}</span>
            </p>
            <div class="btn-r-wrap">
                <router-link class="btn btn--m" to="/">返回主页</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
    import NavHeader from './../components/NavHeader'
    import NavBread from './../components/NavBread'
    import {currency} from './../util/currency'
    import axios from 'axios'
    export default{
        data(){
            return{
                orderId:'',
                orderTotal:0
            }
        },
        components:{
          NavHeader,
          NavBread
        },
        filters:{
          currency:currency
        },
        mounted(){
            var orderId = this.$route.query.orderId;
            console.log("orderId:"+orderId);
            if(!orderId){
              return;
            }
            axios.get("/users/orderDetail",{
                params:{
                  orderId:orderId
                }
            }).then((response)=>{
                let res = response.data;
                if(res.status=='0'){
                    this.orderId = orderId;
                    this.orderTotal = res.result.orderTotal;
                }
            });
        }
    }
</script>
