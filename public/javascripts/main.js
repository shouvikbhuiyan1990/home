var app = angular.module('homeCalc',[]);

app.controller('homeCalcCtrl',['$scope','$http','$rootScope','dataFactory',function($scope,$http,$rootScope,dataFactory){
	var payableObj = {payee : '',payable : 0, payer: ''};

	$scope.payableArr = [];

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
	};

	$scope.$on('/homecalc/update/view',function(e,data){
		$scope.record = data;
	});

	var modularFunctionality = {
		sortData : function(data){
			data.map(function(value,index){
				var maxEleIndex = this.selectMax(data);
			})
			
		},
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
					//payableObj.payee = value.name;
					//payableObj.payable = 0;
					$scope.payableArr.push({payee:value.name,payable:0,payer:''});
				}
			})
		},
		selectMax : function(data){
			var maxValue = data[0].total;
			var maxIndex;
			data.map(function(value,index){
				if(maxValue < value.total){
					maxValue = value.total;
					maxIndex = index;
				}
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