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
        data.graphJS = {};
        data.cores = null;

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
            if (name === 'criarGrafo') { // 0
                fn.criarGrafo();
            } else if (name === 'addVertice') { // 1
                fn.addVertice();
            } else if (name === 'rmVertice') { // 2
                fn.rmVertice();
            } else if (name === 'addAresta') { // 3
                fn.addAresta();
            } else if (name === 'rmAresta') { // 4
                fn.rmAresta();
            } else if (name === 'vrVertice') { // 5
                fn.vrVertice(null, true);
            } else if (name === 'vrAresta') { // 6
                fn.vrAresta(null, null, true);
            } else if (name === 'rtArestas') { // 7
                fn.rtArestas(null, true);
            } else if (name === 'printGrafo') { // 8
                fn.printGrafo();
            } else if (name === 'abrirXML') { // 9
                fn.abrirXML();
            } else if (name === 'vrPlanaridade') { // 9
                fn.vrPlanaridade(true);
            } else if (name === 'bfs_dfs') { // -
                fn.bfs_dfs();
            } else if (name === 'dijkstra') { // -
                fn.dijkstra();
            } else if (name === 'welsh_powell') {
                fn.coloracaoWP();
            } else if (name === 'dsatur') {
                fn.coloracaoDSATUR();
            } else if (name === 'prim') {
                fn.prim();
            } else if (name === 'kruskal') {
                fn.kruskal();
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
                                peso: vizinho[2],
                                fluxo: 0
                            });
                        }
                        if (!data.grafo.direcionado && vizinho[1] === nome) {
                            vizinhos.push({
                                aberto: true,
                                anterior: null,
                                distancia: infinite,
                                nome: vizinho[0],
                                atual: false,
                                peso: vizinho[2],
                                fluxo: 0,
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
            var caminhos = [];
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
                                // if (vizinhos[i].nome === fim) {
                                //     //stop = true;
                                //     menor.nome = vizinhos[i].nome;
                                //     menor.distancia = atual.distancia + vizinhos[i].peso;
                                //     menor.anterior = atual.nome;
                                // } else
                                // // Se a distância do vizinho é maior que a distância do vértice atual mais o peso da aresta que os une
                                if (grafo[vizinhos[i].nome].aberto && vizinhos[i].distancia > (atual.distancia + vizinhos[i].peso)) {
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
                        //caminho.push(grafo[ini].nome);
                        grafo[menor.nome].distancia = menor.distancia;
                        grafo[menor.nome].anterior = menor.anterior;
                        grafo[menor.nome].atual = true;

                        if (menor.nome === fim) {
                            caminhos.push(caminho);
                            caminho = [];
                        }
                    }

                }

                console.log(JSON.stringify(caminhos));

                var djikstra = [];

                for (var i = 0; i < vertices.length; i++) {
                    djikstra.push(grafo[vertices[i]]);
                }

                console.log(djikstra);

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


        fn.graphJS = function () {
            var s, g = {nodes: [], edges: []};

            var vertices = data.grafo.vertices;
            var arestas = data.grafo.arestas;

            // Generate a random graph:
            for (var v = 0; v < vertices.length; v++) {
                g.nodes.push({
                    id: vertices[v],
                    label: vertices[v],
                    x: Math.random(),
                    y: Math.random(),
                    size: 3,
                    color: "#00ff16"
                });
            }


            //
            for (var a = 0; a < arestas.length; a++) {
                g.edges.push({
                    id: arestas[a][0] + '_' + arestas[a][1],
                    source: arestas[a][0],
                    target: arestas[a][1],
                    size: arestas[a][2] ? arestas[a][2] : 1,
                    color: '#00ff16'
                });
            }

            data.graphJS.kill();

            // Instantiate sigma:
            data.graphJS = new sigma({
                graph: g,
                container: 'graph-container',
                settings: {labelColor: 'node', labelThreshold: 0, labelSizeRatio: 4, labelSize: 'proportional'}
            });


            if (data.cores) {
                for (var ag = 1; ag < data.cores.length; ag++) {
                    var node = data.graphJS.graph.nodes(data.cores[ag].vertice);
                    node.color = data.cores[ag].cor;
                }
                data.graphJS.refresh();
            }
            data.graphJS.graph.nodes().forEach(function (node, i, a) {
                node.x = Math.cos(Math.PI * 2 * i / a.length);
                node.y = Math.sin(Math.PI * 2 * i / a.length);
            });
            data.graphJS.refresh();
        };


        fn.coloracaoWP = function () {

            var vertices = data.grafo.vertices;
            var arestas = data.grafo.arestas;
            var a, v, s;

            //Criar um vetor de cores
            var cores = ['green', 'blue', 'yellow', 'red', 'purple'];
            console.log(cores);

            //Ordenar os vértices pelo seu grau em ordem decrescente
            var arestasByGrau = [];
            for (v = 0; v < vertices.length; v++) {
                arestasByGrau.push(
                    {
                        vertice: vertices[v],
                        grau: fn.rtArestas(vertices[v]).length,
                        //Inicializar todos os vértices como “sem cor”
                        cor: null,
                        adjacentes: fn.rtArestas(vertices[v])
                    }
                );
            }

            arestasByGrau.sort(function (a, b) {
                if (a.grau < b.grau) {
                    return 1;
                }
                if (a.grau > b.grau) {
                    return -1;
                }
                return 0;
            });

            function semCor() {
                for (var a = 0; a < arestasByGrau.length; a++) {
                    if (null === arestasByGrau[a].cor) {
                        return true;
                    }
                }
                return false;
            }

            function isMesmaCor(adjacentes, cor) {
                for (var a = 0; a < adjacentes.length; a++) {
                    for (var s = 0; s < arestasByGrau.length; s++) {
                        var vertice = arestasByGrau[s].vertice;
                        //console.log(adjacentes[a][0], adjacentes[a][1]);
                        if (adjacentes[a][0] === vertice || adjacentes[a][1] === vertice) {
                            console.log(vertice, arestasByGrau[s].cor);
                            if (arestasByGrau[s].cor === cor) {
                                console.log('isMesmaCor', cor, JSON.stringify(adjacentes));
                                return true;
                            }
                        }
                    }
                }
                console.log('notMesmaCor', cor, JSON.stringify(adjacentes));
                return false;
            }

            var cont = 0;
            // Enquanto o existir um vértice sem cor no grafo {
            while (semCor() && cont < cores.length) {
                console.log(cores[cont]);
                // Para cada vértice do grafo sem cor (seguindo a lista ordenada)
                for (v = 0; v < arestasByGrau.length; v++) {
                    if (null === arestasByGrau[v].cor) {
                        // Atribuir a cor atual caso ele não tenha um vértice adjacente com a mesma cor
                        if (!isMesmaCor(arestasByGrau[v].adjacentes, cores[cont])) {
                            delete arestasByGrau[v]['adjacentes'];
                            arestasByGrau[v].cor = cores[cont];
                        }
                    }
                }
                cont++;
            }
            console.log(JSON.stringify(arestasByGrau));
            data.cores = arestasByGrau;
            for (var ag = 1; ag < data.cores.length; ag++) {
                var node = data.graphJS.graph.nodes(data.cores[ag].vertice);
                node.color = data.cores[ag].cor;
            }
            data.graphJS.refresh();
        };

        fn.coloracaoDSATUR = function () {

            var vertices = data.grafo.vertices;
            var arestas = data.grafo.arestas;
            var a, v, s;

            //Criar um vetor de cores
            var cores = ['green', 'blue', 'yellow', 'red', 'purple'];
            console.log(cores);

            //Ordenar os vértices pelo seu grau em ordem decrescente
            var arestasByGrau = [];
            for (v = 0; v < vertices.length; v++) {
                arestasByGrau.push(
                    {
                        vertice: vertices[v],
                        grau: fn.rtArestas(vertices[v]).length,
                        //Inicializar todos os vértices como “sem cor”
                        cor: null,
                        adjacentes: fn.rtArestas(vertices[v]),
                        saturacao: 0
                    }
                );
            }

            arestasByGrau.sort(function (a, b) {
                if (a.grau < b.grau) {
                    return 1;
                }
                if (a.grau > b.grau) {
                    return -1;
                }
                return 0;
            });

            function semCor() {
                for (var a = 0; a < arestasByGrau.length; a++) {
                    if (null === arestasByGrau[a].cor) {
                        return true;
                    }
                }
                return false;
            }

            function isMesmaCorAdjacente(adjacentes, cor) {
                for (var a = 0; a < adjacentes.length; a++) {
                    for (var s = 0; s < arestasByGrau.length; s++) {
                        var vertice = arestasByGrau[s].vertice;
                        //console.log(adjacentes[a][0], adjacentes[a][1]);
                        if (adjacentes[a][0] === vertice || adjacentes[a][1] === vertice) {
                            console.log(vertice, arestasByGrau[s].cor);
                            if (arestasByGrau[s].cor === cor) {
                                console.log('isMesmaCorAdjacente', cor, JSON.stringify(adjacentes));
                                return true;
                            }
                        }
                    }
                }
                console.log('notMesmaCor', cor, JSON.stringify(adjacentes));
                return false;
            }

            function saturacaoAdjacentes(adjacentes, atual) {
                var a;
                var arrAdjacentes = [];
                for (a = 0; a < adjacentes.length; a++) {
                    if (atual !== adjacentes[a][0] && arrAdjacentes.indexOf(adjacentes[a][0]) === -1) {
                        arrAdjacentes.push(adjacentes[a][0]);
                    }
                    if (atual !== adjacentes[a][1] && arrAdjacentes.indexOf(adjacentes[a][1]) === -1) {
                        arrAdjacentes.push(adjacentes[a][1]);
                    }
                }
                console.log(atual, JSON.stringify(arrAdjacentes));
                for (a = 0; a < arrAdjacentes.length; a++) {
                    for (var s = 0; s < arestasByGrau.length; s++) {
                        var vertice = arestasByGrau[s].vertice;
                        if (arrAdjacentes[a] === vertice) {
                            arestasByGrau[s].saturacao++;
                        }
                    }
                }
            }

            function maiorSaturacaoAndGrau() {
                var maior = {saturacao: 0};
                for (var a = 1; a < arestasByGrau.length; a++) {
                    if (arestasByGrau[a].cor === null) {
                        if (arestasByGrau[a].saturacao > maior.saturacao) {
                            maior = arestasByGrau[a];
                        }
                    }
                }
                for (var m = 0; m < arestasByGrau.length; m++) {
                    if (maior.vertice === arestasByGrau[m].vertice) {
                        return m;
                    }
                }
            }

            //Colorir o vértice com maior grau com a primeira cor
            saturacaoAdjacentes(arestasByGrau[0].adjacentes, arestasByGrau[0].vertice);
            delete arestasByGrau[0]['adjacentes'];
            arestasByGrau[0].cor = cores[0];
            //console.log(arestasByGrau[0]);

            // Enquanto o existir um vértice sem cor no grafo {
            while (semCor()) {
                // Selecionar o vértice com maior grau de saturação, em caso de empate, escolher o com maior grau dentre os de maior saturação
                var maior = maiorSaturacaoAndGrau();
                console.log(maior);
                if (maior) {
                    for (var c = 0; c < cores.length; c++) {
                        // Atribuir a cor atual caso ele não tenha um vértice adjacente com a mesma cor
                        if (arestasByGrau[maior].cor === null && !isMesmaCorAdjacente(arestasByGrau[maior].adjacentes, cores[c])) {
                            saturacaoAdjacentes(arestasByGrau[maior].adjacentes, arestasByGrau[maior].vertice);
                            delete arestasByGrau[maior]['adjacentes'];
                            arestasByGrau[maior].cor = cores[c];
                        }
                    }
                }
            }
            console.log(JSON.stringify(arestasByGrau));
            data.cores = arestasByGrau;
            for (var ag = 1; ag < data.cores.length; ag++) {
                var node = data.graphJS.graph.nodes(data.cores[ag].vertice);
                node.color = data.cores[ag].cor;
            }
            data.graphJS.refresh();
        };


        fn.prim = function () {

            // Inicia um conjunto S vazio de arestas para a solução
            // Inicia um conjunto Q com todos os vértices do grafo para o controle
            var S = [], Q = angular.copy(data.grafo.vertices), v, a, total = 0;


            // Escolhe um vértice arbitrário A do grafo como vértice inicial
            var random = (Math.floor(Math.random() * data.grafo.vertices.length) + 1) - 1;
            var vInicial = angular.copy(data.grafo.vertices[random]);

            function _removeVertice(v) {
                angular.forEach(Q, function (value, key) {
                    if (value === v) {
                        Q.splice(key, 1);
                    }
                });
            }

            // Remove A do conjunto Q
            _removeVertice(vInicial);

            var cont = 0;
            while (Q.length > 0 && cont < 20) { // Enquanto Q não estiver vazio{
                cont++;
                var U, V, menor = infinite;

                //     Encontra a menor aresta {U, V}, onde U pertencente ao conjunto Q e V não pertence ao conjunto Q
                for (a = 0; a < data.grafo.arestas.length; a++) {
                    var aresta = data.grafo.arestas[a];
                    if (Q.indexOf(aresta[0]) !== -1 && Q.indexOf(aresta[1]) === -1) {
                        if (aresta[2] < menor) {
                            U = aresta[0];
                            V = aresta[1];
                            menor = aresta[2];
                        }
                    } else if (Q.indexOf(aresta[1]) !== -1 && Q.indexOf(aresta[0]) === -1) {
                        if (aresta[2] < menor) {
                            U = aresta[1];
                            V = aresta[0];
                            menor = aresta[2];
                        }
                    }
                    console.log(U, V, menor);
                }


                if (menor !== infinite) {
                    //     Adiciona a aresta {U, V} para o conjunto solução S
                    S.push([U, V, menor]);
                    total += menor;
                    //     Remove o vértice U do conjunto de controle Q
                    _removeVertice(U);
                }


            }// }

            fn.alert(
                'Solucao: ' + JSON.stringify(S) + '\n\rTotal: ' + total +
                '\n\r\n\r\n\r Controle: ' + JSON.stringify(Q)
            );


        };


        fn.kruskal = function () {

            // Inicia um conjunto S vazio de arestas para a solução
            // Inicia um conjunto Q com todas as arestas do grafo para o controle
            var S = [], Q = angular.copy(data.grafo.arestas), F = [], v, a, total = 0;

            // Inicia uma floresta (um conjunto de árvores) F com cada vértice isolado sendo uma árvore
            for (v = 0; v < data.grafo.vertices.length; v++) {
                F.push([data.grafo.vertices[v]]);
            }


            // Remove a aresta {U, V} do conjunto Q
            function _removeAresta(U, V) {
                angular.forEach(Q, function (value, key) {
                    if (value[0] === U && value[1] === V) {
                        Q.splice(key, 1);
                    } else if (value[1] === U && value[0] === V) {
                        Q.splice(key, 1);
                    }
                });
            }

            // Verifica se U e V estão em conjuntos diferentes de arvore
            function _isDiferenteConjuntoArvore(U, V) {
                var indiceU, IndiceV;
                for (var i = 0; i < F.length; i++) {
                    if (F[i].indexOf(U) >= 0) {
                        indiceU = F[i].indexOf(U);
                    }
                    if (F[i].indexOf(V) >= 0) {
                        IndiceV = F[i].indexOf(V);
                    }
                }
                return indiceU === IndiceV;
            }

            var cont = 0;
            while (Q.length > 0 && cont < 10) { // Enquanto Q não estiver vazio{
                cont++;

                var U, V, menor = infinite;

                //     Seleciona a menor aresta {U, V} do conjunto Q
                for (a = 0; a < Q.length; a++) {
                    var aresta = Q[a];
                    if (aresta[2] < menor) {
                        U = aresta[0];
                        V = aresta[1];
                        menor = aresta[2];
                    }
                }

                //     Remove a aresta {U, V} do conjunto Q
                _removeAresta(U, V);

                console.log(U, V, _isDiferenteConjuntoArvore(U, V));

                if (_isDiferenteConjuntoArvore(U, V)) { //     Se U e V pertencem a árvores diferentes no conjunto F{
                    // Adiciona a aresta {U, V} para o conjunto S
                    S.push([U, V, menor]);
                    total += menor;
                    // Une as árvores que contém U e que contém V no conjunto F
                    var iFU = [-1, -1], iFV = [-1, -1];
                    for (var i = 0; i < F.length; i++) {
                        if (F[i].indexOf(U) >= 0) {
                            iFU = i;
                        }
                        if (F[i].indexOf(V) >= 0) {
                            iFV = i;
                        }
                    }
                    if (iFU >= 0 && iFU >= 0) {
                        F[iFU] = [].concat(F[iFU], F[iFV]);
                        console.log(F[iFU]);
                        F.splice(iFV, 1);
                    }
                } //     }

            }// }

            fn.alert(
                'Solucao: ' + JSON.stringify(S) + '\n\rTotal: ' + total +
                '\n\r\n\r\n\r Floresta: ' + JSON.stringify(F) +
                '\n\r\n\r\n\r Controle: ' + JSON.stringify(Q)
            );

        };
            fn.exist = function (nome,lista) {
                for (var i = 0; i < lista.length;i++){
                 if (lista[i] == nome) {
                     return true;
                 }
             
                }
                return false;
             
            }

        fn.TSPV = function (inicio) {

            // Inicializar todos os vértices como: aberto, sem vértice anterior , distância infinita
            var grafo = fn.startGrafo();
            var stop = false;
            var caminho = [];
            var menor = [];
            var vertices = data.grafo.vertices;
            var posInicial = inicio;
            var distancia = 0;
            //console.log(vertices);
            //console.log("grafo",grafo);
            

            //fn.retornaMenor = function (v) {
            
            //}

            caminho.push(posInicial);
            //console.log("c:", caminho);
            var num = 0;
            while (true) {
                //console.log("run: ", num);
                var menorDistancia = 99999;
                var menorVertice;
                for (var indiceA = 0;indiceA < grafo[posInicial].vizinhos.length;indiceA++){
                    //console.log(indiceA,grafo[posInicial].vizinhos[indiceA]);
                    if (  grafo[posInicial].vizinhos[indiceA].peso < menorDistancia &&  !fn.exist(grafo[posInicial].vizinhos[indiceA].nome,caminho)) {
                        menorDistancia = grafo[posInicial].vizinhos[indiceA].peso;
                        menorVertice = grafo[posInicial].vizinhos[indiceA].nome;
                    }
                    
                //console.log("menor: ",menorVertice);
                }
                if(menorVertice === posInicial) {
                    break;
                }
                caminho.push(menorVertice);
                distancia += menorDistancia;
                num += 1;
                posInicial = menorVertice;
            }
            console.log("Caminho do vertice:",inicio," ", caminho, "Distancia: ",distancia );
            return [caminho, distancia];
            
            // var _recursiveRun = function (start, visitados, caminho, p) {
            //     if (p < grafo[start].vizinhos.length) {
            //         if (visitados.indexOf(grafo[start].vizinhos[p]) === -1) {
            //             visitados.push(grafo[start].vizinhos[p].nome);
            //             caminho.push({nome: grafo[start].vizinhos[p].nome, peso: grafo[start].vizinhos[p].peso});
            //             $timeout(function () {
            //                 var x = _recursiveRun(grafo[start].vizinhos[p].nome, visitados, caminho, p + 1);
            //                 if (x) {
            //                     caminho.push(x);
            //                 }
            //             });
            //         }
            //     }
            //     if (caminho && caminhos.indexOf(caminho) === -1) {
            //         caminhos.push(caminho);
            //     }
            // };

            // _recursiveRun(vertices[0], [], [], 0);


            //fn.alert(JSON.stringify(caminhos+" "+distancia));


        };

        fn.TSP = function () {
            //var fo = fn.startGrafo();
            var vertices = data.grafo.vertices;
            //console.log(vertices);
            var caminhos = [];
            
            for (var indice = 0;indice < vertices.length;indice++){
                //console.log("JASEFHAKSGFH: ", vertices[indice]);
                caminhos.push(fn.TSPV(vertices[indice]));
            }

            var menor = 9999;
            var indiceMenor;
            //console.log("FIM");
            //console.log(caminhos);
            for (var indiceB = 0;indiceB < caminhos.length ;indiceB++) {
                if ( caminhos[indiceB][1] < menor ){
                    menor = caminhos[indiceB][1];
                    indiceMenor = indiceB;
                }
            }
            console.log("Menor Caminho do Grafo: ", caminhos[indiceMenor]);
            fn.alert(JSON.stringify("Menor Caminho do Grafo: "+ caminhos[indiceMenor]));
            //fn.alert(JSON.stringify(caminhos+" "+distancia));
        }

        fn.FF = function () {
            var grafo = fn.startGrafo();
            
            var vertices = data.grafo.vertices;
            //grafo[posInicial].vizinhos.length
            var origem = [];
            var destino = [];

            for (var indiceA = 0; indiceA < vertices.length; indiceA++ ){
                grafo[vertices[indiceA]].origem = 0;
                grafo[vertices[indiceA]].destino = 0;
            }
            for (var indice = 0; indice < vertices.length; indice++) {
                for (var indiceA = 0; indiceA < vertices.length; indiceA++ ){
                    for( var indiceB = 0; indiceB < grafo[vertices[indiceA]].vizinhos.length; indiceB++){
                        console.log(grafo[vertices[indiceA]].vizinhos[indiceB]);
                        console.log("+++",grafo[vertices[indice]].nome,"+++",grafo[vertices[indiceA]].vizinhos[indiceB].nome,"+++")
                        if (grafo[vertices[indice]].nome == grafo[vertices[indiceA]].vizinhos[indiceB].nome) {
                            
                            grafo[vertices[indice]].destino++;
                        }

                    }
                }
                if (grafo[vertices[indice]].vizinhos.length == 0 ){
                    destino.push(indice);
                }
            }
            for (var indiceC = 0; indiceC < vertices.length; indiceC++) {
                
                if ( grafo[vertices[indiceC]].destino == 0){
                    origem.push(indiceC);
                }
            }
            console.log("----------------------------------------")
            console.log(origem)
            console.log("----------------------------------------")
            console.log(destino)
            console.log("----------------------------------------")
            console.log("fonte: ", grafo[vertices[origem[0]]], 
                        "servidouro: ", grafo[vertices[destino[0]]]);
            console.log("----------------------------------------")


            var caminhos = [["A","B","C","E","F"],
                            ["A","B","D","F"],
                            ["A","B","D","C","E","F"],
                            ["A","C","E","F"],
                            ["A","C","B","D","F"],
                            ["A","C","B","D","C","E","F"]];
            console.log(caminhos);

            // var grafoResidual = {
            //     nome: null,
            //     vizinhos: [{
            //         nome: null,
            //         peso: null,
            //         fluxo: null}]
            // };
            console.log("+_+_+_+_+_+_+_+_+");
 /*           console.log(grafoResidual);
            var grafoResidual = grafo;
            for(var indiceA;indiceA<vertices.length;indiceA++){
                grafoResidual[indiceA].nome = grafo[vertices[indiceA]].nome;
                for(var indiceB;indiceB<grafo[vertices[indiceA]].vizinhos.length;indiceB++){
                    grafoResidual[indiceA].vizinhos[indiceB].nome = grafo[vertices[indiceA]].vizinhos[indiceB].nome;
                    grafoResidual[indiceA].vizinhos[indiceB].peso = grafo[vertices[indiceA]].vizinhos[indiceB].peso;
                    grafoResidual[indiceA].vizinhos[indiceB].fluxo = 0;
                }
            }
            console.log("+_+_+_+_+_+_+_+_+");
            console.log(grafoResidual);
            var fn_ehvizinho = function (v,n){
                for(indiceA = 0;indiceA<v.length;indiceA++){
                    if(v[indiceA].nome == n) {
                        return true;
                    }
                }
                return false;
            };

            var soma = 0;
            var caminho = caminhos[0];
            var menorCapacidade = 999;
            var fluxomaximo = 0;
            for(var indiceA = 0;indiceA < caminho.length;indiceA++){
                for(indiceB = 0;indiceB < grafoResidual[caminho[indiceA]].vizinhos.length;indiceB++) {
                    if(grafoResidual[caminho[indiceA]].vizinhos[indiceB].nome == caminho[indiceA+1]){
                        if (grafoResidual[caminho[indiceA]].vizinhos[indiceB].peso < menorCapacidade && grafoResidual[caminho[indiceA]].vizinhos[indiceB].peso != 0 ){
                            menorCapacidade = grafoResidual[caminho[indiceA]].vizinhos[indiceB].peso;
                        }
                        soma += grafoResidual[caminho[indiceA]].vizinhos[indiceB].peso;
                        console.log(soma);
                    }
                }
            }
            for(var indiceA = 0;indiceA < caminho.length;indiceA++){
                for(indiceB = 0;indiceB < grafoResidual[caminho[indiceA]].vizinhos.length;indiceB++) {
                    if(!fn_ehvizinho(grafoResidual[vizinhos[indiceB].nome].vizinhos,caminho[indiceA])){
                            grafoResidual[vizinhos[indiceB].nome].vizinhos.push({
                                aberto: true,
                                anterior: null,
                                distancia: infinite,
                                nome: caminho[indiceA],
                                atual: false,
                                peso: vizinho[2],
                                fluxo: menorCapacidade
                            });
                    }
                    grafoResidual[caminho[indiceA]].vizinhos[indiceB].fluxo = menorCapacidade;
                    grafoResidual[caminho[indiceA]].vizinhos[indiceB].peso -= menorCapacidade;
                }
            }
        */
 

            // Represents an ff_vertice from origem to destino with capacidade
            var ff_vertice = function(origem, destino, capacidade) {
                this.origem = origem;
                this.destino = destino;
                this.capacidade = capacidade;
                this.retorno = null;
                this.fluxo = 0;
            };

                                // Represents an ff_vertice from origem to destino with capacidade
            var ff_vertice = function(origem, destino, capacidade) {
                this.origem = origem;
                this.destino = destino;
                this.capacidade = capacidade;
                this.reverso = null;
                this.fluxo = 0;
            };
            var ff_vertices = {origem: [], destino: []};
            // Main class to manage the network
            var fluxoNetwork = function() {
                

                // Is this ff_vertice/residual capacidade combination in the caminho already?
                this.ff_verticenoCaminho = function(caminho, ff_vertice, residual) {
                    for(var p=0;p<caminho.length;p++) 
                        if(caminho[p][0] == ff_vertice && caminho[p][1] == residual) 
                            return true;
                    return false;
                };
                
                this.addff_vertice = function(origem, destino, capacidade) {
                    if(origem == destino) return;
                    
                    // Create the two ff_vertices = one being the reverse of the other    
                    var ff_ver = new ff_vertice(origem, destino, capacidade);
                    var reverso = new ff_vertice(destino, origem, 0);
                    
                    // Make sure we setup the pointer to the reverse ff_vertice
                    ff_ver.reverso = reverso;
                    reverso.reverso = ff_ver;
                    
                    if(ff_vertices[origem] === undefined) ff_vertices[origem] = [];
                    if(ff_vertices[destino] === undefined) ff_vertices[destino] = [];   
                    
                    ff_vertices[origem].push(ff_ver);
                    ff_vertices[destino].push(reverso);
                    //console.log(ff_vertices[origem],"ksdfasdf",ff_ver)
                };
                
                // Finds a caminho from origem to destino
                this.dfs = function(origem, destino, caminho) {
                    if(origem == destino) return caminho;
                    
                    for(var i=0;i<ff_vertices[origem].length;i++) {
                        var ff_ver = ff_vertices[origem][i];
                        var residual = ff_ver.capacidade - ff_vertice.fluxo;
                        
                        // If we have capacidade and we haven't already visited this ff_vertice, visit it
                        if(residual > 0 && !this.ff_verticenoCaminho(caminho, ff_ver, residual)) {
                            var tcaminho = caminho.slice(0);
                            tcaminho.push([ff_ver, residual]);
                            var resultado = this.dfs(ff_ver.destino, destino, tcaminho);
                            if(resultado != null) return resultado;
                        } 
                    }
                    return null;
                };
                
                // Find the max fluxo in this network
                this.fluxoMaximo = function(origem, destino) {
                    var caminho = this.dfs(origem, destino, []);
                    while(caminho != null) {
                        var fluxo = 999999;
                        // Find the minimum fluxo
                        for(var i=0;i<caminho.length;i++)
                            if(caminho[i][1] < fluxo) {
                                fluxo = caminho[i][1];
                            }
                        // Apply the fluxo to the ff_vertice and the reverse ff_vertice
                        for(var i=0;i<caminho.length;i++) {
                            caminho[i][0].fluxo += fluxo;
                            caminho[i][0].reverso.fluxo -= fluxo;
                        } 
                        caminho = this.dfs(origem, destino, []);
                    }
                    var fluxomaximo = 0;
                    for(var i=0;i<ff_vertices[origem].length;i++)
                        fluxomaximo += ff_vertices[origem][i].fluxo;
                    return fluxomaximo;
                };
            };

            var ford = new fluxoNetwork();
            //var max = fn.maxFlow(grafo[ff_vertices[origem[0]]],grafo[ff_vertices[destino[0]]]);
            for (var indiceA = 0; indiceA < vertices.length; indiceA++ ){
                for( var indiceB = 0; indiceB < grafo[vertices[indiceA]].vizinhos.length; indiceB++){
                    ford.addff_vertice(vertices[indiceA], grafo[vertices[indiceA]].vizinhos[indiceB].nome,grafo[vertices[indiceA]].vizinhos[indiceB].peso);
                }
            }
            console.log(ford.ff_vertices);
            console.log("============================");
            console.log(ford.fluxoMaximo("A","F"));

            //console.log(soma, menorCapacidade);
            //console.log(grafoResidual);
            fn.alert(JSON.stringify("FF"));
        }

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
                direcionado: true,
                vertices: [],
                arestas: []
            };
            data.historico = [];

            $timeout(function () {

/*              fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addAresta('A', 'C', 7);
                fn.addAresta('A', 'D', 2);
                fn.addAresta('A', 'E', 10);
                fn.addAresta('B', 'C', 3);
                fn.addAresta('B', 'F', 2);
                fn.addAresta('C', 'E', 9);
                fn.addAresta('C', 'F', 3);
                fn.addAresta('D', 'E', 7);
                fn.addAresta('D', 'F', 4);
                fn.addAresta('E', 'F', 8);*/


                //TESTE CAIXEIRO VIAJANTE
                // fn.addVertice();
                // fn.addVertice();
                // fn.addVertice();
                // fn.addVertice();
                // fn.addVertice();
                // fn.addVertice();
                // fn.addVertice();
                // fn.addAresta('A', 'B', 5);
                // fn.addAresta('A', 'C', 15);
                // fn.addAresta('A', 'D', 4);
                // fn.addAresta('A', 'E', 5);
                // fn.addAresta('A', 'F', 12);
                // fn.addAresta('A', 'G', 10);
                // fn.addAresta('B', 'C', 8);
                // fn.addAresta('B', 'D', 15);
                // fn.addAresta('B', 'E', 3);
                // fn.addAresta('B', 'F', 9);
                // fn.addAresta('B', 'G', 12);
                // fn.addAresta('C', 'D', 8);
                // fn.addAresta('C', 'E', 8);
                // fn.addAresta('C', 'F', 5);
                // fn.addAresta('C', 'G', 5);
                // fn.addAresta('D', 'E', 8);
                // fn.addAresta('D', 'F', 6);
                // fn.addAresta('D', 'G', 11);
                // fn.addAresta('E', 'F', 20);
                // fn.addAresta('E', 'G', 7);
                // fn.addAresta('F', 'G', 11);

                //fn.TSPV('A');
                //fn.TSP();

                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addVertice();
                fn.addAresta('A','B', 16)
                fn.addAresta('A','C', 13)
                fn.addAresta('B','C', 10)
                fn.addAresta('B','D', 12)
                fn.addAresta('C','B', 4)
                fn.addAresta('C','E', 14)
                fn.addAresta('D','C', 9)
                fn.addAresta('D','F', 20)
                fn.addAresta('E','D', 7)
                fn.addAresta('E','F', 4)
                fn.FF();

            }, 1000);
            $timeout(function () {
                data.graphJS = new sigma({graph: {}, container: 'graph-container'});
            })
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
