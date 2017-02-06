'use strict';

const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
const UNDEFINED = void 0;

//定义promise构造函数
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

//then方法，必须返回一个新的promise实例
//
Promise.prototype.then = function (onResolved, onRejected) {
	//只要状态变化了，但是参数不是函数，忽略
	if(typeof onResolved !== 'function' && this.state === RESOLVED ||
		typeof onRejected !== 'function' && this.state === REJECTED) {
		return this;
	}

	let promise = new this.constructor();

	if(this.state !== PENDING) {
		let callback = this.state === RESOLVED ? onResolved : onRejected;
		executeCallbackAsync.call(promise, callback, this.data);
	} else {
		this.callbackQueue.forEach(v => v[type](x));
	}

	return promise;


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

function executeCallback(type, x) {
	let isResolve = type === 'resolve';
	let thenable;
	//如果x是一个对象或者函数
	if( isResolve && (typeof x === 'object' || typeof x === 'function') ) {
		try {
			thenable = getThen(x);
		} catch (err) {
			return executeCallback.call(this, 'reject', err);
		}
	}

	if(isResolve && thenable) {
		executeResolver.call(this, thenable);
	} else {
		this.state = isResolve ? RESOLVED : REJECTED;
		this.data = x;
		this.callbackQueue && this.callbackQueue.length && this.callbackQueue.forEach((v)=>{
			v[type](x);
		});
	}
	return this;
}

function getThen(obj) {
	let then = obj && obj.then;
	if(obj && typeof obj === 'object' && typeof then === 'function') {
		return function applyThen() {
			then.apply(obj, arguments);
		}
	}
}

//异步执行then方法中的回调函数
function executeCallbackAsync(callback, value) {
	let _this = this;
	setTimeout(function () {
		let res;
		try {
			res = callback(value);
		} catch(err) {
			return executeCallback.call(this, 'reject', err);
		}

		if(res !== _this) {
			return executeCallback.call(_this, 'resolve', res);
		} else {
			return executeCallback.call(_this, 'reject', new TypeError('error'));
		}
	}, 1);
}






























