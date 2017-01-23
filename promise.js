'use strict';

const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
const UNDEFINED = void 0;


function Promise (resolver) {
	if(!resolver || typeof resolver !== 'function') {
		return;
	}
	//promise的初始状态
	this.state = PENDING;
	//当前promise对象的数据
	this.data = UNDEFINED;
	//当前promise注册的回调队列
	this.callbackQueue = [];
	if(resolver) {
		executeResolver.call(this, resolver);
	}
}

Promise.prototype.then = function () {

}

//给promise增加成功和失败的函数
function executeResolver (resolver) {
	let called = false;
	let _this = this;

	function onError(value) {
		if(called) {
			return;
		}
		called = true;

		executeCallback.call(this, 'reject', value);
	}

	function onSuccess(value) {
		if(called) {
			return;
		}
		called = true;
		executeCallback.call(this, 'resolve', value);
	}

	try {
		resover(onSuccess, onError);
	} catch(err) {
		onError(err);
	}
}

function execuCallback(type, x) {
	let isResolve = type === 'resolve';
	let thenable;

	if( isResolve && (typeof x === 'object' || typeof x === 'function') ) {
		try {
			thenable = getThen(x);
		} catch (err) {
			return executeCallback.call(this, 'reject', err);
		}
	}

	if(isResolve && thenable) {
		executeCallback.call(this, thenable);
	} else {
		this.state = isResolve ? RESOLVED : REJECTED;
		this.data = x;
		this.callbackQueue && this.callbackQueue.length && this.callbackQueue.forEach((v)=>{
			v[type](x);
		});
	}
	return this;
}


























