(function () {
    'use strict';
    angular.module('app')
        .controller('LayoutCtrl', LayoutCtrl)
        .controller('DialogCtrl', DialogCtrl);

    function LayoutCtrl($scope, $mdDialog, $mdSidenav, $window) {

        var fn = {}, data = {};
        $scope.fn = fn;
        $scope.data = data;
        $mdSidenav("left").open();

        fn.start = function () {
            data.settings = {
                printLayout: true,
                showRuler: true,
                showSpellingSuggestions: true,
                presentationMode: 'edit',
                sideNav: true
            };
            data.marginLeft = {'margin-left': '320px'};
            data.grafo = {
                direcionado: false,
                vertices: [],
                arestas: []
            };
            data.historico = [];
        };

        fn.start();

        document.body.onkeydown = function (e) {
            //console.log(e.keyCode);
            if (e.keyCode === 48 || e.keyCode === 96) {
                $scope.$apply(fn.criarGrafo());
            } else if (e.keyCode === 49 || e.keyCode === 97) {
                $scope.$apply(fn.addVertice());
            } else if (e.keyCode === 50 || e.keyCode === 98) {
                $scope.$apply(fn.rmVertice());
            } else if (e.keyCode === 51 || e.keyCode === 99) {
                $scope.$apply(fn.addAresta());
            } else if (e.keyCode === 52 || e.keyCode === 100) {
                $scope.$apply(fn.rmAresta());
            } else if (e.keyCode === 53 || e.keyCode === 101) {
                $scope.$apply(fn.vrVertice(null, true));
            } else if (e.keyCode === 54 || e.keyCode === 102) {
                $scope.$apply(fn.vrAresta(null, null, true));
            } else if (e.keyCode === 55 || e.keyCode === 103) {
                $scope.$apply(fn.rtArestas(null, true));
            } else if (e.keyCode === 56 || e.keyCode === 104) {
                $scope.$apply(fn.printGrafo());
            } else if (e.keyCode === 57 || e.keyCode === 105) {
                $scope.$apply(fn.abrirXML());
            } else if (e.keyCode === 58 || e.keyCode === 106) {
                $scope.$apply(fn.vrPlanaridade());
            }
        };

        fn.actions = function (name, ev) {
            if (name == 'criarGrafo') { // 0
                fn.criarGrafo();
            } else if (name == 'addVertice') { // 1
                fn.addVertice();
            } else if (name == 'rmVertice') { // 2
                fn.rmVertice();
            } else if (name == 'addAresta') { // 3
                fn.addAresta();
            } else if (name == 'rmAresta') { // 4
                fn.rmAresta();
            } else if (name == 'vrVertice') { // 5
                fn.vrVertice(null, true);
            } else if (name == 'vrAresta') { // 6
                fn.vrAresta(null, null, true);
            } else if (name == 'rtArestas') { // 7
                fn.rtArestas(null, true);
            } else if (name == 'printGrafo') { // 8
                fn.printGrafo();
            } else if (name == 'abrirXML') { // 9
                fn.abrirXML();
            } else if (name == 'vrPlanaridade') { // 9
                fn.vrPlanaridade(true);
            }
        };

        /* ###################################################
         *  ##########    FUNÇÕES DO GRAFO    ################
         * ####################################################
         * */

        // Criar Grafo (Direcional ou Não)
        fn.criarGrafo = function () {
            $mdDialog.show({
                controller: DialogCtrl,
                templateUrl: 'src/layout/dialogs/criarGrafo.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    grafo: data.grafo,
                    fn: fn
                }
            }).then(function (resposta) {
                data.grafo.direcionado = resposta;
                data.historico.push("Criado Grafo: {direcionado: " + resposta + "}");
            });
        };

        // Adicionar Vértice (Criar um rótulo)
        fn.addVertice = function () {
            var nextLetter = '';
            if (data.grafo.vertices.length <= 0) {
                nextLetter = 'A';
            } else {
                nextLetter = String.fromCharCode(data.grafo.vertices[data.grafo.vertices.length - 1].charCodeAt(0) + 1);
            }
            if (nextLetter <= 'Z') {
                data.grafo.vertices.push(nextLetter);
                data.historico.push("Vértices Adicionado: " + nextLetter);
            } else {
                data.historico.push("Limite de Vértices Alcançado!");
            }
        };

        // Remover Vértice (Remove todas as arestas ligadas à ele)
        fn.rmVertice = function (label) {
            if (label) {
                angular.forEach(data.grafo.vertices, function (vertice, index) {
                    if (label == vertice) {
                        data.grafo.vertices.splice(index, 1);
                    }
                });
            } else {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/rmVertice.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo
                    }
                }).then(function (resposta) {
                    if (resposta) {
                        fn.rmVertice(resposta);
                        data.historico.push("Vértice Removido: " + resposta);
                    }
                });
            }
        };

        // Adicionar Aresta/Arco
        fn.addAresta = function () {
            $mdDialog.show({
                controller: DialogCtrl,
                templateUrl: 'src/layout/dialogs/addAresta.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    grafo: data.grafo,
                    fn: fn
                }
            }).then(function (resposta) {
                if (resposta[0] && resposta[1]) {
                    data.grafo.arestas.push(resposta);
                    data.historico.push("Aresta Adicionada: " + resposta[0] + " -> " + resposta[1]);
                }
            });
        };

        // Remover Aresta
        fn.rmAresta = function (a, b) {
            if (a && b) {
                angular.forEach(data.grafo.arestas, function (aresta, index) {
                    if (a == aresta[0] && b == aresta[1]) {
                        data.grafo.arestas.splice(index, 1);
                    }
                });
            } else {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/rmAresta.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    if (resposta[0] && resposta[1]) {
                        fn.rmAresta(resposta[0], resposta[1]);
                        data.historico.push("Aresta Removida: " + resposta[0] + " -> " + resposta[1]);
                    }
                });
            }
        };

        // Verificar Vértice (Verifica se existe um vértice no grafo com um rótulo específico)
        fn.vrVertice = function (label, showAlert) {
            if (label) {
                var exists = false;
                angular.forEach(data.grafo.vertices, function (vertice, index) {
                    if (label == vertice) {
                        exists = true;
                    }
                });
                if (showAlert) {
                    if (exists) {
                        fn.alert("Existe o Vértice: " + label);
                    } else {
                        fn.alert("Não Existe o Vértice: " + label);
                    }
                }
                return exists;
            } else {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/vrVertice.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    if (resposta) {
                        fn.vrVertice(resposta, showAlert);
                    }
                });
            }
        };

        // Verificar Aresta (Verifica se existe uma aresta ligando dois vértices especificados)
        fn.vrAresta = function (a, b, showAlert) {
            if (a && b) {
                var exists = false;
                angular.forEach(data.grafo.arestas, function (aresta, index) {
                    if (data.grafo.direcionado) {
                        if (a == aresta[0] && b == aresta[1]) {
                            exists = true;
                        }
                    } else {
                        if (aresta.indexOf(a) >= 0 && aresta.indexOf(b) >= 0) {
                            exists = true;
                        }
                    }
                });
                if (showAlert) {
                    if (exists) {
                        fn.alert("Existe a Aresta: " + a + (data.grafo.direcionado ? " -> " : " <> ") + b);
                    } else {
                        fn.alert("Não Existe a Aresta: " + a + (data.grafo.direcionado ? " -> " : " <> ") + b);
                    }
                }
                console.log(a,b,exists);
                return exists;
            } else {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/vrAresta.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    if (resposta[0] && resposta[1]) {
                        fn.vrAresta(resposta[0], resposta[1], showAlert);
                    }
                });
            }
        };

        // Retornar Arestas (Retorna todas as arestas de um vértice)
        fn.rtArestas = function (v, showAlert) {
            if (v) {
                var arestas = [];
                angular.forEach(data.grafo.arestas, function (aresta, index) {
                    if (data.grafo.direcionado) {
                        if (v == aresta[0]) {
                            arestas.push(aresta);
                        }
                    } else {
                        if (aresta.indexOf(v) >= 0) {
                            arestas.push(aresta);
                        }
                    }
                });
                if (showAlert) {
                    if (arestas.length > 0) {
                        fn.alert("Existe a Arestas: " + JSON.stringify(arestas));
                    } else {
                        fn.alert("Não Existe a Arestas!");
                    }
                }
                return arestas;
            } else {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/rtArestas.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    if (resposta) {
                        fn.rtArestas(resposta, showAlert);
                    }
                });
            }
        };

        // Imprimir Grafo (Exibe em forma de texto todos os vértices e as arestas ligadas à eles)
        fn.printGrafo = function () {
            $mdDialog.show({
                controller: DialogCtrl,
                templateUrl: 'src/layout/dialogs/printGrafo.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    grafo: data.grafo,
                    fn: fn
                }
            });
        };

        // (Extra) abrir XML
        fn.abrirXML = function () {

        };


        // Verificar Planaridade
        fn.vrPlanaridade = function (showAlert) {
            if (a && b) {
                var planar = false;
                angular.forEach(data.grafo.arestas, function (aresta, index) {
                    for (var a = 0; a < data.grafo.arestas.length; a++) {
                        if (data.grafo.direcionado) {
                            if (index >= 2 && data.grafo.arestas[a][0] == aresta[1]) {
                                planar = true;
                            }
                        } else {
                            if (index >= 2) {
                                if (aresta.indexOf(data.grafo.arestas[a][0])) {
                                    planar = true;
                                }
                            }
                        }

                    }
                });
                if (showAlert) {
                    if (planar) {
                        fn.alert("Grafo é Planar!");
                    } else {
                        fn.alert("Grafo não é Planar!");
                    }
                }
                return planar;
            }
        };

        /* ###################################################
         *  ##########     FUNÇÕES GERAIS      ################
         * ####################################################
         * */

        $scope.$watch('data.settings.sideNav', function () {
            if (data.settings.sideNav) {
                $mdSidenav("left").open();
                data.marginLeft = {'margin-left': '330px'};
            } else {
                $mdSidenav("left").close();
                data.marginLeft = {'margin-left': '0px'};
            }
        });

        fn.alert = function (message) {
            $mdDialog.show($mdDialog.alert()
                .title('Alerta!')
                .textContent(message)
                .ok('OK')
            );
        };

    }

    function DialogCtrl($scope, $mdDialog, grafo, fn) {

        $scope.grafo = grafo;

        var data = {};
        $scope.fn = fn;
        $scope.data = data;
        data.grafo = grafo;

        $scope.cancela = function () {
            $mdDialog.hide();
        };

        $scope.confirma = function (resposta) {
            $mdDialog.hide(resposta);
        };

    }
})();
