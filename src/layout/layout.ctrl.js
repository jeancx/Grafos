(function () {
    'use strict';
    angular.module('app')
        .controller('LayoutCtrl', LayoutCtrl)
        .controller('DialogCtrl', DialogCtrl);

    function LayoutCtrl($scope, $mdDialog, $mdSidenav, $window, $timeout) {

        var fn = {}, data = {};
        $scope.fn = fn;
        $scope.data = data;
        $mdSidenav("left").open();
        var infinite = Math.pow(2, 53);

        document.body.onkeydown = function (e) {
            console.log(e.keyCode);
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
            } else if (e.keyCode === 189 || e.keyCode === 109) {
                $scope.$apply(fn.bfs_dfs());
            } else if (e.keyCode === 187 || e.keyCode === 107) {
                $scope.$apply(fn.dijkstra());
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
            } else if (name == 'bfs_dfs') { // -
                fn.bfs_dfs();
            } else if (name == 'dijkstra') { // -
                fn.dijkstra();
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
                        var vertices = fn.rtArestas(vertice);
                        for (var v = 0; v < vertices.length; v++) {
                            fn.rmAresta(vertices[v][0], vertices[v][1]);
                        }
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
                        grafo: data.grafo,
                        fn: fn
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
        fn.addAresta = function (a, b, peso) {
            if (a && b) {
                data.grafo.arestas.push([a, b, peso ? peso : 0]);
                data.historico.push("Aresta Adicionada: " + a + " -> " + b);
            } else {
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
                    if (resposta && resposta[0] && resposta[1]) {
                        fn.addAresta(resposta[0], resposta[1], resposta[2]);
                    }
                });
            }
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
                    if (resposta && resposta[0] && resposta[1]) {
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
                console.log(a, b, exists);
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
                    if (resposta && resposta[0] && resposta[1]) {
                        fn.vrAresta(resposta[0], resposta[1], showAlert);
                    }
                });
            }
        };

        // Retornar Arestas (Retorna todas as arestas de um vértice)
        fn.rtArestas = function (nome, showAlert) {
            if (nome) {
                var arestas = [];
                angular.forEach(data.grafo.arestas, function (aresta, index) {
                    if (data.grafo.direcionado) {
                        if (nome === aresta[0]) {
                            arestas.push(aresta);
                        }
                    } else {
                        if (aresta.indexOf(nome) >= 0) {
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

            function _vrPlanaridade() {
                var caminhos = [];
                var vertices = angular.copy(data.grafo.vertices);
                var arestas = angular.copy(data.grafo.arestas);
                var inicio = null;
                for (var i = 0; i < vertices.length; i++) {
                    inicio = vertices[i];
                    var arestaAtual = null;
                    var passos = 1;
                    var caminho = [];
                    var visitados = [];
                    visitados.push(inicio[0]);
                    for (var v = 0; v < vertices.length; v++) {
                        var next = null;
                        for (var a = 0; a < arestas.length; a++) {
                            if (!next) {
                                if (!arestaAtual) {
                                    if (arestas[a][0] === inicio) {
                                        next = arestaAtual = arestas[a];
                                        caminho.push(arestaAtual);
                                    }
                                } else if (arestaAtual[1] === arestas[a][0] && caminho.indexOf(arestas[a]) === -1) {
                                    if (passos < 2 && visitados.indexOf(arestas[a][1]) === -1) {
                                        next = arestaAtual = arestas[a];
                                        caminho.push(arestaAtual);
                                        passos++;
                                        visitados.push(arestas[a][0]);
                                    } else if (passos === 2) {
                                        if (arestaAtual[1] === arestas[a][0] && arestas[a][1] === inicio) {
                                            next = arestaAtual = arestas[a];
                                            caminho.push(arestaAtual);
                                            passos++;
                                            caminhos.push(caminho);
                                            return [caminhos, true];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    caminhos.push(caminho);
                }
                return [caminhos, false];
            }

            var response = _vrPlanaridade();
            console.log(JSON.stringify(response));
            if (response[1]) {
                fn.alert("Grafo é Planar!");
            } else {
                fn.alert("Grafo não é Planar!");
            }
        };


        // Inicializa Grafo e Vizinhos
        fn.startGrafo = function () {
            var grafo = [];

            function _rtVizinhos(nome) {
                var vizinhos = [];
                if (nome) {
                    angular.forEach(fn.rtArestas(nome, false), function (vizinho, index) {
                        if (vizinho[0] === nome) {
                            vizinhos.push({
                                aberto: true,
                                anterior: null,
                                distancia: infinite,
                                nome: vizinho[1],
                                atual: false,
                                peso: vizinho[2]
                            });
                        }
                    });
                }
                return vizinhos;
            }

            angular.forEach(angular.copy(data.grafo.vertices), function (v, index) {
                grafo[v] = {
                    aberto: true,
                    anterior: null,
                    distancia: infinite,
                    nome: v,
                    atual: false,
                    vizinhos: _rtVizinhos(v)
                };
            });
            return grafo;
        };


        //Função BFS

        fn.bfs_dfs = function (ini) {

            var grafo = fn.startGrafo();

            var stop = false;

            var caminho = [];

            function _BFS(inicio, fim) {

                var fila = [];
                grafo[inicio].aberto = true;
                // Definir um vértice inicial como atual
                fila.push(grafo[inicio].nome);
                caminho.push({nome: grafo[inicio].nome});

                if (inicio !== fim) {
                    while (fila.length > 0) {
                        var no = grafo[fila[0]];
                        fila.shift();
                        for (var i = 0; i < no.vizinhos.length; i++) {
                            var vizinho = no.vizinhos[i];
                            if (grafo[vizinho.nome].aberto) {
                                grafo[vizinho.nome].aberto = false;
                                caminho.push({nome: vizinho.nome, peso: vizinho.peso});
                                //console.log(grafo[vizinho.nome]);
                                if (grafo[vizinho.nome].nome === fim) {
                                    fn.alert(JSON.stringify(caminho));
                                    return false;
                                }
                                fila.push(grafo[vizinho.nome].nome);
                            } else if (fila.indexOf(grafo[vizinho.nome])) {
                                grafo[vizinho.nome].aberto = false;
                                caminho.push(grafo[vizinho.nome].nome);
                                caminho.push({nome: vizinho.nome, peso: vizinho.peso});
                                if (grafo[vizinho.nome].nome === fim) {
                                    fn.alert(JSON.stringify(caminho));
                                    return false;
                                }
                            }
                        }
                    }
                } else {
                    console.log(grafo[inicio]);
                }
                fn.alert(JSON.stringify(caminho));
            }

            function _DFS(pos, final) {

                caminho.push({nome: grafo[pos].nome});

                console.log(grafo[pos]);

                grafo[pos].aberto = false;

                if (grafo[pos].nome === final) {
                    console.log(grafo[pos]);
                    stop = true;
                }
                if (grafo[pos].nome !== final && !stop) {
                    // var menor = {nome: '', peso: infinite};
                    for (var j = 0; j < grafo[pos].vizinhos.length; j++) {
                        var no = grafo[pos].vizinhos[j];
                        console.log(no);
                        if (no.nome === final && !stop) {
                            stop = true;
                        }
                        // if(!stop && no.peso < menor.peso && grafo[no.nome].aberto){
                        //     menor = {nome: no.nome, peso: no.peso};
                        // }
                        if (grafo[no.nome].aberto && !stop) {
                            _DFS(grafo[no.nome].nome, final);
                        }
                    }
                    // if(!stop && menor.nome){
                    //     caminho.push(menor);
                    //     _DFS(grafo[menor.nome].nome, final);
                    // }
                }

                console.log(JSON.stringify(caminho));

                fn.alert(JSON.stringify(caminho));

            }


            if (!ini) {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/setBfsDfs.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    if (resposta[0]) {
                        _BFS(resposta[1], data.grafo.vertices[data.grafo.vertices.length - 1]);
                    } else {
                        _DFS(resposta[1], data.grafo.vertices[data.grafo.vertices.length - 1], []);
                    }
                });
                return false;
            } else {
                _dijkstra(ini, fim);
            }


        };


        //Função Dijkstra
        fn.dijkstra = function (ini, fim) {

            // Inicializar todos os vértices como: aberto, sem vértice anterior , distância infinita
            var grafo = fn.startGrafo();
            var stop = false;
            var caminho = [];
            var vertices = data.grafo.vertices;

            function _dijkstra(ini, fim) {

                // Definir o vértice inicial como vértice atual
                grafo[ini].atual = true;
                // Definir a distância do vértice atual como zero
                grafo[ini].distancia = 0;

                caminho.push(grafo[ini].nome);

                var cont = 0;

                function _isOpenAndNotInfinite() {
                    cont++;
                    if (stop || cont > 99) {
                        return false;
                    }
                    for (var i = 0; i < vertices.length; i++) {
                        if (grafo[vertices[i]].aberto && grafo[vertices[i]].distancia < infinite) {
                            return true;
                        }
                    }
                    return false;
                }

                function _rtVerticeAtual() {
                    for (var i = 0; i < vertices.length; i++) {
                        if (grafo[vertices[i]].atual) {
                            return grafo[vertices[i]];
                        }
                    }
                    for (var i = 0; i < vertices.length; i++) {
                        if (grafo[vertices[i]].aberto) {
                            return grafo[vertices[i]];
                        }
                    }
                    //stop = true;
                }

                // Enquanto existir algum vértice aberto com distância não infinita
                while (_isOpenAndNotInfinite()) {
                    var atual = _rtVerticeAtual();

                    // if (atual.nome === fim) {
                    //     stop = true;
                    // }

                    var menor = {
                        nome: '',
                        anterior: null,
                        distancia: infinite
                    };

                    //if (!stop) {
                    // Para cada vizinhos do vértices atual
                    var vizinhos = grafo[atual.nome].vizinhos;
                    if (vizinhos && vizinhos.length > 0) {
                        for (var i = 0; i < vizinhos.length; i++) {
                            if (vizinhos[i] && vizinhos[i].distancia) {
                                if (vizinhos[i].nome === fim) {
                                    //stop = true;
                                    menor.nome = vizinhos[i].nome;
                                    menor.distancia = atual.distancia + vizinhos[i].peso;
                                    menor.anterior = atual.nome;
                                }
                                // Se a distância do vizinho é maior que a distância do vértice atual mais o peso da aresta que os une
                                if (!stop && grafo[vizinhos[i].nome].aberto && vizinhos[i].distancia > (atual.distancia + vizinhos[i].peso)) {
                                    // Atribuir esta nova distância ao vizinho
                                    // Definir como vértice anterior deste vizinho o vértice atual
                                    //caminho.push(grafo[ini].nome);
                                    grafo[vizinhos[i].nome].distancia = atual.distancia + vizinhos[i].peso;
                                    grafo[vizinhos[i].nome].anterior = atual.nome;
                                    grafo[vizinhos[i].nome].atual = false;

                                    if ((atual.distancia + vizinhos[i].peso) < menor.distancia) {
                                        menor.nome = vizinhos[i].nome;
                                        menor.distancia = atual.distancia + vizinhos[i].peso;
                                        menor.anterior = atual.nome;
                                    }
                                }
                            }
                        }
                    }
                    //}

                    // Marcar o vértice atual como fechado
                    grafo[atual.nome].aberto = false;
                    grafo[atual.nome].atual = false;

                    if (menor && menor.nome) {
                        caminho.push(menor.nome);
                        // Definir o vértice aberto com a menor distância (não infinita) como o vértice atual
                        caminho.push(grafo[ini].nome);
                        grafo[menor.nome].distancia = menor.distancia;
                        grafo[menor.nome].anterior = menor.anterior;
                        grafo[menor.nome].atual = true;
                    }

                }

                console.log(JSON.stringify(caminho));

                var djikstra = [];

                for (var i = 0; i < vertices.length; i++) {
                    djikstra.push(grafo[vertices[i]]);
                }

                console.log(grafo);

                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/printDijkstra.html',
                    parent: angular.element(document.body),
                    locals: {
                        grafo: djikstra,
                        fn: fn
                    }
                });

            }


            if (!ini) {
                $mdDialog.show({
                    controller: DialogCtrl,
                    templateUrl: 'src/layout/dialogs/fnDijsktra.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        grafo: data.grafo,
                        fn: fn
                    }
                }).then(function (resposta) {
                    _dijkstra(resposta[0], resposta[1]);
                });
                return false;
            } else {
                _dijkstra(ini, fim);
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

            $timeout(function () {
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addAresta('A', 'B', 3);
                fn.addAresta('A', 'C', 5);
                fn.addAresta('A', 'D', 6);
                fn.addAresta('B', 'D', 2);
                fn.addAresta('B', 'E', 9);
                fn.addAresta('C', 'E', 2);
                fn.addAresta('A', 'E', 8);
            }, 1000);

        };

        fn.start();

    }

    function DialogCtrl($scope, $mdDialog, grafo, fn) {

        $scope.fn = fn;
        $scope.grafo = grafo;
        $scope.pesos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        $scope.cancela = function () {
            $mdDialog.hide();
        };

        $scope.confirma = function (resposta) {
            $mdDialog.hide(resposta);
        };

    }
})();
