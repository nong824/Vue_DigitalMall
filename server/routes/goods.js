var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var Goods=require('../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/db_mall');

mongoose.connection.on("connected",function(){
    console.log("数据库连接成功")
});

mongoose.connection.on("error",function(){
    console.log("数据库连接失败")
});

mongoose.connection.on("disconnected",function(){
    console.log("数据库连接中断")
});

//查询商品列表数据
router.get("/list",function(req,res,next){
    let page=parseInt(req.param("page"));
    let pageSize=parseInt(req.param("pageSize"));
    let priceLevel=req.param("priceLevel");
    let sort=req.param("sort");
    let skip=(page-1)*pageSize;
    var priceGt='' ,priceLte='';
    let params={};
    if(priceLevel!='all'){
        switch(priceLevel){
            case '0':priceGt=0;priceLte=100;break;
            case '1':priceGt=100;priceLte=500;break;
            case '2':priceGt=500;priceLte=1000;break;
            case '3':priceGt=1000;priceLte=3000;break;
            case '4':priceGt=3000;priceLte=5000;break;
            case '5':priceGt=5000;priceLte=10000;break;
        }
        params={
            salePrice:{
                $gt:priceGt,
                $lte:priceLte
            }
        }
    }
    
    let goodsModel= Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort});

    goodsModel.exec(function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:{
                    count:doc.length,
                    list:doc
                }
            })
        }
    });
});

//搜索商品
router.post("/search",function(req,res,next){
    var productName=new RegExp(req.body.productName);
    Goods.find({"productName":productName},function(error,doc){
        if(error){
            console.log("error:"+error);
            res.json({
                status:'1',
                msg:err.message
            });
        }else{
            if(doc.length>0){
                console.log("商品已找到："+doc);
                res.json({
                    status:'0',
                    msg:'',
                    result:{
                        doc
                    }
                });
            }
            else{
                console.log("商品未找到");
                res.json({
                status:'2',
                msg:''
                });
            }
        }
    });
});


//加入购物车
router.post("/addCart",function(req,res,next){
    var userId=req.cookies.userId,productId = req.body.productId;//get取参数req.param，post取参数req.body
    var User=require('../models/user');

    User.findOne({userId:userId},function(err,userDoc){
        if(err){
            res.json({
                status:'1',
                msg:err.message
            })
        }else{
            console.log("userDoc:"+userDoc);
            if(userDoc){
                let goodsItem='';
                userDoc.cartList.forEach(function(item){
                    if(item.productId==productId){
                        goodsItem=item;
                        item.productNum++;
                    }
                });
                if(goodsItem){
                    userDoc.save(function(err2,doc2){
                        if(err2){
                            res.json({
                                status:'1',
                                msg:err2.message
                            })
                        }else{
                            res.json({
                                status:'0',
                                msg:'',
                                result:'suc'
                            })
                        }
                    })
                }else{
                    Goods.findOne({productId:productId},function(err1,doc){
                        if(err1){
                            res.json({
                                status:'1',
                                msg:err1.message
                            }) 
                        }else{
                            if(doc){
                                doc.productNum=1;
                                doc.checked=1;
                                userDoc.cartList.push(doc);
                                userDoc.save(function(err2,doc2){
                                    if(err2){
                                        res.json({
                                            status:'1',
                                            msg:err2.message
                                        })
                                    }else{
                                        res.json({
                                            status:'0',
                                            msg:'',
                                            result:'suc'
                                        })
                                    }
                                })
                            }
                        }
                    });
                }
            }
        }
    })
});
module.exports=router;