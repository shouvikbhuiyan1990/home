var app = angular.module('homeCalc',[]);

app.controller('homeCalcCtrl',['$scope','$http','$rootScope','dataFactory',function($scope,$http,$rootScope,dataFactory){
	var payableObj = {payee : '',payable : 0, payer: ''};

	$scope.payableArr = [];

	var giveArr =[], takeArr = [];

	$http.get('/homecalc/find/all').success(function(data){
		$scope.record = data;
	})

	$scope.addMoreRecords = function(){
		var newRecord = {name:'',total:0,amount:0};
		//$scope.record.push(newRecord);
		$http.post('/homecalc/record/add',newRecord).success(function(data){
			dataFactory.updateView();
		})
	};

	$scope.generateExpenseReport = function(){
		$http.get('/homecalc/find/all').success(function(data){
			modularFunctionality.splitArr(data);
		});
		takeArr.length = 0;
		giveArr.length = 0;
		$scope.payableArr.length = 0;
	};

	$scope.$on('/homecalc/update/view',function(e,data){
		$scope.record = data;
	});

	var modularFunctionality = {
		splitArr : function(data){
			var maxValue 
			    ,total = 0
				,avg;
			data.map(function(value,index){
				total = total + value.total;
			});
			avg = total/data.length;
			data.map(function(value,index){
				if(value.total === avg){
					$scope.payableArr.push({payee:value.name,payable:0,payer:''});
				}
				else if(value.total > avg){
					value.total = value.total-avg;
					takeArr.push(value);
				}
				else{
					value.total = avg - value.total;
					giveArr.push(value);
				}
			});
			var j = takeArr.length;
			for(var i=0; i<j ;i++){
				var maxTake = this.selectMax(takeArr).index;
				var maxGive = this.selectMax(giveArr).index;
				var remain = 2;
				if(takeArr[maxTake].total > giveArr[maxGive].total){
					while(takeArr[maxTake].total > 0 && remain>0){
						maxGive = this.selectMax(giveArr).index;
						remain = takeArr[maxTake].total - giveArr[maxGive].total;
						
						if(remain < 0){
							$scope.payableArr.push({payee:takeArr[maxTake].name,payable:takeArr[maxTake].total,payer:giveArr[maxGive].name});
							giveArr[maxGive].total = giveArr[maxGive].total - takeArr[maxTake].total;
							takeArr.splice(maxTake,1);
						}
						else{
							$scope.payableArr.push({payee:takeArr[maxTake].name,payable:giveArr[maxGive].total,payer:giveArr[maxGive].name});
							takeArr[maxTake].total = takeArr[maxTake].total - giveArr[maxGive].total;
							giveArr.splice(maxGive,1);
						}
					}
				}
			}
		},
		selectMax : function(data){
			var maxValue = data[0].total;
			var maxIndex;
			data.map(function(value,index){
				if(maxValue < value.total){
					maxValue = value.total;
					maxIndex = index;
				}
				else
					maxIndex = 0;
			});
			return { 'index' : maxIndex , 'value' : maxValue};
		}
	}

}]);

app.directive('personRecord',['$http','dataFactory',function(http,dataFactory){
	return{
		restrict : 'AE',
		templateUrl : 'views/template.html',
		link : function(scope,ele,attr){
			var reqObjct = {};
			ele.bind('submit',function(){
				reqObjct.id = attr.id;
				reqObjct.name = scope.name;
				http.post('/homecalc/record/findone',reqObjct).success(function(data){
					reqObjct.amount = parseInt(scope.amount) + parseInt(data.total);
					http.post('/homecalc/record/update',reqObjct).success(function(innerData){
						dataFactory.updateView();
					})
				})
				
				
			})
		}
	}
}]);


app.factory('dataFactory',['$rootScope','$http',function($rootScope,$http){
	return{
		updateView : function(){
				$http.get('/homecalc/find/all').success(function(data){
				$rootScope.$broadcast('/homecalc/update/view',data);
			});
		}
	}
}])