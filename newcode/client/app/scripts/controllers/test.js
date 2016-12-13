'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('TestCtrl', function BasicDemoCtrl($scope, $mdDialog) {
        var alert;
        $scope.showAlert = showAlert;
        $scope.showDialog = showDialog;
        $scope.items = [1, 2, 3];

        // Internal method
        function showAlert() {
            alert = $mdDialog.alert({
                title: 'Attentionaaa',
                textContent: 'This is an example of how easy dialogs can be!',
                ok: 'Close'
            });

            $mdDialog
                .show(alert)
                .finally(function () {
                    alert = undefined;
                });
        }
        $scope.showPrerenderedDialog = function () {
            $mdDialog.show({
                contentElement: '#myStaticDialog',
                parent: angular.element(document.body)
            });
        };

        function showDialog($event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template: '<md-dialog aria-label="List dialog">' +
                    '  <md-dialog-content>' +
                    '    <md-list>' +
                    '      <md-list-item ng-repeat="item in items">' +
                    '       <p>Number {{item}}</p>' +
                    '      ' +
                    '    </md-list-item></md-list>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <md-button ng-click="closeDialog()" class="md-primary">' +
                    '      Close Dialog' +
                    '    </md-button>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',
                locals: {
                    items: $scope.items
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, items) {
                $scope.items = items;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                }
            }
        }
    })
