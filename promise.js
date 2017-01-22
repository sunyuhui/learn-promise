const PENDING = 'pending';
const RESOLVED = 'resolve';
const REJECTED = 'reject';
const UNDEFINED = 'undefined';

function Promise (resolver) {
	if(!resolver || typeof resolver !== 'function') {
		throw new Error('resolver is not a function');
	}

	this.state = PENDING;		//当前promise对象的状态
	this.data = UNDEFINED;		//当前promise对象的数据（成功或者失败）
	this.callbackQueue = []; 	//当前promise对象的回调队列

	if(resolver) executeResolver.call(this, resolver);   //执行resolve 或者 reject方法
}


Promise.prototype.then = function (onResolved, onRejected) {
	if(typeof onResolved !== 'function' && this.state === RESOLVED ||
	   typeof onRejected !== 'function' && this.state === REJECTED) {
		return this;
	}

	var promise = new this.constructor;

	if(this.state !== PENDING) {
		var callback = this.state === RESOLVED ? onResolved : onRejected;
		executeCallbackAsync.bind(promise)(callback, this.data);
	} else {
		this.callbackQueue.forEach((v)=>{
			v[type](x);
		});
	}

	return promise;
};

Promise.prototype.catch = function(onRejected){
  return this.then(null, onRejected);
}

function executeCallbackAsync (callback, value) {
	var _this = this;
	setTimeout(function() {
		var res;
		try {
			res = callback(value);
		} catch (err) {
			return executeCallback.bind(_this)('reject', err);
		}

		if(res !== _this) {
			return executeCallback.bind(_this)('resolve', res);
		} else {
			return executeCallback.bind(_this)('reject', new TypeError('can not resolve param with itself'));
		}
	}, 1);
}


function executeResolver (resolver) {
	let called = false;
	let _this = this;

	function onError (value) {
		if(called) {
			return;
		}

		called = true;

		executeCallback.bind(_this)('reject', value);
	}

	function onSuccess (value) {
		if(called) {
			return;
		}
		called = true;

		executeCallback.bind(_this)('resolve', value);
	}

	try{
		resolver(onSuccess, onError);
	} catch(err) {
		onError(err);
	}
}

function executeCallback(type, x) {
	var isResolve = type === 'resolve';
	var thenable;

	if(isResolve && (typeof x === 'object' || typeof x === 'function')) {
		try {
			thenable = getThen(x);
		} catch (err) {
			return executeCallback.bind(this)('reject', err);
		}
	}
	if(isResolve && thenable) {
		executeResolver.bind(this)(thenable);
	} else {
		this.state = isResolve ? RESOLVED : REJECTED;
		this.data = x;
		this.callbackQueue && this.callbackQueue.length && this.callbackQueue.forEach(
			(v) => v[type](x)
		);
	}

	return this;
}

function getThen(obj) {
	var then = obj && obj.then;
	if(obj && typeof obj === 'object' && typeof then === 'function') {
		return function applyThen() {
			then.apply(obj, arguments);
		}
	}
}

// 用于注册then中的回调 .then(resolvedFn, rejectedFn)
function CallbackItem(promise, onResolved, onRejected){
  this.promise = promise;
  // 为了保证在promise链中，resolve或reject的结果可以一直向后传递，可以默认给then添加resolvedFn和rejectedFn
  this.onResolved = typeof onResolved === 'function' ? onResolved : function(v){return v};
  this.onRejected = typeof onRejected === 'function' ? onRejected : function(v){throw v};
}
CallbackItem.prototype.resolve = function(value){
//调用时异步调用 [标准 2.2.4]
  executeCallbackAsync.bind(this.promise)(this.onResolved, value);
}
CallbackItem.prototype.reject = function(value){
//调用时异步调用 [标准 2.2.4]
  executeCallbackAsync.bind(this.promise)(this.onRejected, value);
}



















