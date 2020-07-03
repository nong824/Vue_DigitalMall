<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>商品列表</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          
          <span class="sortby">按价格排序:</span>
          <a href="javascript:void(0)" class="price" @click="sortGoods">
            价格
            <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':sortFlag}">
              <use xlink:href="#icon-arrow-short" />
            </svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop"  @click="showFilterPop">价格区间</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
            <div class="search bar6">
          <form>
            <input type="text" placeholder="请根据商品名搜索" v-model="searchGoodsName">
            <button type="submit" @click="searchGoods"></button>
          </form>
          </div>
            <dl class="filter-price" style="margin-top:20px">
              <dt>价格区间:</dt>
              <dd>
                <a href="javascript:void(0)" @click="setPriceFilter('all')" v-bind:class="{'cur':priceChecked=='all'}">全 部</a>
              </dd>
              <dd v-for="(price,index) in priceFilter">
                <a href="javascript:void(0)"  @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{price.startPrice|currency('')}} - {{price.endPrice|currency('')}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list --> 
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item,index) in goodsList">
                  <div class="pic">
                    <a href="#">
                      <img v-lazy="'/static/'+item.productImage" alt />
                    </a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice|currency('')}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>                      
              </ul>
              <div  class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
      <p slot="message">
        请先登录，否则无法加入到购物车中！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShow=false">关闭</a>
      </div>
    </modal>
    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
      <p slot="message">
        <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#iicon-status-ok"></use>
        </svg>
        <span>加入购物车成功！</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShowCart=false">继续购物</a>
        <router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
      </div>
    </modal>
    <modal v-bind:mdShow="searchModal" v-on:close="closeModal">
      <p slot="message">
        搜索成功！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m md-show" href="javascript:;" @click="searchModal=false">确认</a>
      </div>
    </modal>
    <modal v-bind:mdShow="searchNullModal" v-on:close="closeModal">
      <p slot="message">
        未搜索到该商品！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m md-show" href="javascript:;" @click="searchNullModal=false">关闭</a>
        
      </div>
    </modal>
    <div class="md-overlay" v-show="overLayFlag" @click.stop="closePop"></div>
  </div>
</template>

<script>
  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import NavHeader from '@/components/NavHeader.vue'
  import NavFooter from '@/components/NavFooter.vue' 
  import NavBread from '@/components/NavBread.vue'
  import Modal from '@/components/Modal.vue'
  import axios from 'axios'
  export default{
    data () {
      return {
        goodsList:[],
        sortFlag:true,
        page:1,
        pageSize:8,
        busy:true,
        loading:false,
        mdShow:false,
        mdShowCart:false,
        searchGoodsName:'',
        searchModal:false,
        searchNullModal:false,
        
        priceFilter:[
          {
            startPrice:'0.00',
            endPrice:'100.00'
          },
          {
            startPrice:'100.00',
            endPrice:'500.00'
          },
          {
            startPrice:'500.00',
            endPrice:'1000.00'
          },
          {
            startPrice:'1000.00',
            endPrice:'3000.00'
          },
          {
            startPrice:'3000.00',
            endPrice:'5000.00'
          },
          {
            startPrice:'5000.00',
            endPrice:'10000.00'
          },
        ],
        priceChecked:'all',
        filterBy:false,
        overLayFlag:false
      }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,
      Modal
    },
    mounted:function() {
      this.getGoodsList();
    },

    methods: {
      searchGoods(){
        axios.post("goods/search",{
          productName:this.searchGoodsName,
        }).then((response)=>{
          let res=response.data;
          if(res.status==1){
            console.log("查询失败")
          }else if(res.status==0){
            console.log("查询成功")
            this.goodsList=res.result.doc;
            this.searchModal=true;
          }else if(res.status==2){
            console.log("商品未找到")
            this.searchNullModal=true;
          }
        });
      },

      showFilterPop(){
        this.filterBy=true;
        this.overLayFlag=true;
      },

      closePop(){
        this.filterBy=false;
        this.overLayFlag=false;
      },

      getGoodsList(flag){
        var param={
          page:this.page,
          pageSize:this.pageSize,
          sort:this.sortFlag?1:-1,
          priceLevel:this.priceChecked
        }
        this.loading=true;
        axios.get("/goods/list",{
          params:param
        }).then((response)=>{
        let res =response.data;
        this.loading=false;
        if(res.status=="0"){
          if(flag){
            this.goodsList=this.goodsList.concat(res.result.list);
            if(res.result.count=="0"){
              this.busy=true;
            }else{
              this.busy=false;
            }
          }else{
            this.goodsList=res.result.list;
            this.busy=false;
          }
        }else{
          this.goodsList=[];
        }
      });
      },

      //商品价格排序
      sortGoods(){
        this.sortFlag=!this.sortFlag;
        this.page=1;
        this.getGoodsList();
      },

      //商品分页
      loadMore(){
        this.busy=true;
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },

      //商品价格分类
      setPriceFilter(index){
        this.priceChecked=index;
        this.page=1;
        this.getGoodsList();
        this.closePop();
      },

      //加入购物车
      addCart(productId){
        axios.post("/goods/addCart",{
          productId:productId
          }).then((res)=>{
            var res=res.data;
          if(res.status==0){
            this.mdShowCart=true;
            this.$store.commit("updateCartCount",1);
          }else{
            this.mdShow=true;
          }
        });
      },

      closeModal(){
        this.mdShow=false;
        this.mdShowCart=false;
        this.searchModal=false;
        this.searchNullModal=false;
      }
    }
  }
  
</script>
