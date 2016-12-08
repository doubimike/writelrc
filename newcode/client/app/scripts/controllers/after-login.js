'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('AfterLoginCtrl', function() {
        var vm = this;
        vm.lrcs = [{
            title: '简单爱',
            author: '周杰伦',
            publishTime: '20161208',
            likes: 200,
            comments: 100,
            donate: 100,
            reads: 1000,
            collects: 1000,
            content: '内心的深处，我不满足于做一个仅仅是听歌的文艺青年！'
        }, {
            title: '简单爱',
            author: '周杰伦',
            publishTime: '20161208',
            likes: 200,
            comments: 100,
            reads: 1000,
            donate: 100,
            content: '内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！内心的深处，我不满足于做一个仅仅是听歌的文艺青年！'
        }];
    });
