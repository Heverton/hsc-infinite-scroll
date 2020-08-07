import { Location } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { ItemScroll } from './pje-scroll-item.component';

@Component({
  selector: 'app-pje-scroll',
  templateUrl: './pje-scroll.component.html',
  styleUrls: ['./pje-scroll.component.css']
})
export class PjeScrollComponent implements OnInit, OnChanges {

  @Input() recData: ItemScroll[];
  @Input() recItemSelecionado: ItemScroll;
  @Input() recSelecinaClass = '';
  @Input() valuesCacheSize = 5;

  @Input() infScrollDistance = 1;
  @Input() infScrollThrottle = 150;
  @Input() infScrollUpDistance = 2;

  @Output() aoItemNextItem = new EventEmitter<ItemScroll[]>();
  @Output() aoItemSelecionado = new EventEmitter<ItemScroll>();

  private itemDestaque: ItemScroll;
  private arrayvisualizacao: ItemScroll[] = [];

  private posicaoIniDown = 0;
  private posicaoFimDown = 0;

  private posicaoIniUp = 0;
  private posicaoFimUp = 0;

  private reiniciarContagemUp = false;

  constructor(private location: Location) {}

  /**
   * Faz um carga inicial com os dados.
   */
  public ngOnInit(): void {
    (window as any).pdfWorkerSrc = this.location.prepareExternalUrl('/assets/pdf.worker.js');

    this.posicaoFimUp = this.infScrollUpDistance;
    this.posicaoFimDown = this.infScrollUpDistance;

    const item: ItemScroll = this.recData[0];
    const pIndex = PjeScrollComponent.getIndex(this.recData, item);

    const pFimIndexMenos = pIndex - this.valuesCacheSize;
    const pFimIndexMais = pIndex + this.valuesCacheSize;

    this.recolherVisualizacaoAll(this.recData, false);
    this.recolherVisualizacaoRepetir(this.recData, pFimIndexMenos, pFimIndexMais, true);
    this.atribuirFocoEscolhaScrollId(item);
  }

  /**
   * Coleta informações de escolha de item.
   *
   * @param changes SimpleChanges
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.recItemSelecionado && changes.recItemSelecionado.currentValue) {
      if (changes.recItemSelecionado.currentValue === this.recItemSelecionado) {
        const item: ItemScroll = this.recItemSelecionado;
        const pIndex = PjeScrollComponent.getIndex(this.recData, item);

        const pFimIndexMenos = pIndex - this.valuesCacheSize;
        const pFimIndexMais = pIndex + this.valuesCacheSize;

        this.recolherVisualizacaoAll(this.recData, false);
        this.recolherVisualizacaoRepetir(this.recData, pFimIndexMenos, pFimIndexMais, true);
        this.atribuirFocoEscolhaScrollId(item);

        PjeScrollComponent.recolherVisualizacaoDestaqueItem(this.recData, pIndex, true);
      }
    }
  }

  public exibirConteudo(item: ItemScroll): void {
    item.isExibirConteudo = !item.isExibirConteudo;
  }

  /**
   * Realiza o mover dos dados para baixo.
   */
  public onScrollDown(): void {

    const isPosicaoIni = (this.posicaoIniDown < this.recData.length);
    const isPosicaoFim = (this.posicaoFimDown < this.recData.length);

    if (isPosicaoIni) {
      this.posicaoIniDown = this.posicaoFimDown;

      if (this.posicaoIniDown > this.recData.length) {
          this.posicaoIniDown = this.recData.length;
      }
    }

    if (isPosicaoFim) {
      this.posicaoFimDown += this.infScrollUpDistance;

      if (this.posicaoFimDown > this.recData.length) {
          this.posicaoFimDown = this.recData.length;
      }
    }

    if (isPosicaoIni || isPosicaoFim) {
      this.scrollDown(this.posicaoIniDown, this.posicaoFimDown);
    }
  }

  private scrollDown(posicaoIni, posicaoFim): void {
    for (let i = posicaoIni; i < posicaoFim; ++i) {
      const itemNext = this.recData[i];
      if (itemNext !== undefined) {
        this.arrayvisualizacao.push(itemNext);
      }
    }
  }

  public onScrollUp(): void {

    const isPosicaoIni = (this.posicaoIniUp < this.recData.length) && this.posicaoIniDown !== 0;
    const isPosicaoFim = (this.posicaoFimUp < this.recData.length) && this.posicaoIniDown !== 0;

    if (!this.reiniciarContagemUp) {
      if (isPosicaoIni) {
        this.posicaoIniUp = this.posicaoIniUp - this.infScrollUpDistance;
        if (this.posicaoIniUp <= -1) {
          this.posicaoIniUp = 0;
        }
      }

      if (isPosicaoFim) {
        this.posicaoFimUp = this.posicaoFimUp - this.infScrollUpDistance;
        if (this.posicaoFimUp < 0) {
          this.posicaoFimUp = -1;
        }
      }
    }

    if (isPosicaoIni || isPosicaoFim || this.reiniciarContagemUp) {
      this.reiniciarContagemUp = false;
      this.scrollUp(this.posicaoIniUp, this.posicaoFimUp);
    }
  }

  private scrollUp(posicaoIni, posicaoFim): void {
    for (let i = posicaoFim; i >= posicaoIni; --i) {
      const itemNext = this.recData[i];
      if (itemNext !== undefined) {
        this.arrayvisualizacao.unshift(itemNext);
      }
    }
  }

  public notificarDestacarItem(item: ItemScroll): void {
    const pIndex = PjeScrollComponent.getIndex(this.recData, item);
    const isProximo = this.verificarSeProximoDentroLimite(this.recData, pIndex);

    // 1) Verificar se o itens de destaque foi atribuido é e diferente do requisitado.
    // 2) Verificar se é necessário novos itens no 'isProximo'
    if ((this.itemDestaque === undefined || this.itemDestaque.id !== item.id)  || isProximo) {
      // Seta o valor do itens em destaque
      this.itemDestaque = item;
      // O proximo item da lista esta com visibilidade falsa ou não.
      if (!item.isExibirConteudo || isProximo) {
        const pFimIndexMenos = pIndex - this.valuesCacheSize;
        const pFimIndexMais = pIndex + this.valuesCacheSize;
        // Remove a visualização dos itens.
        this.recolherVisualizacaoAll(this.recData, false, item);
        // Atribui a visualização dos itens do período para 'true'
        this.recolherVisualizacaoRepetir(this.recData, pFimIndexMenos, pFimIndexMais, true);
      }

      // Emitir notificacao
      this.aoItemSelecionado.emit(item);
    }
  }

  /**
   * Verifica se o próximo esta dentro do limite de visualização.
   * Ex: Minha visualização é de 10 até 20 posições; Então preciso saber quando
   *  cheguei a posição 10 ou 20 para solicitar mais dados de 1 à 10 ou 20 à 30.
   *
   * @param itens ItemScroll[]
   * @param pIndex number
   */
  private verificarSeProximoDentroLimite(itensGerais: ItemScroll[], pIndex: number): boolean {
    // Se a X posição do array geral é igua a última posição de visualização que é igual a posição pIndex
    const resulDown = (itensGerais[pIndex + 1]?.isExibirConteudo === false);
    // Se a X posição do array geral é igua a primeira posição de visualização que é igual a posição pIndex
    const resulUp = (itensGerais[pIndex - 1]?.isExibirConteudo === false);

    if (resulDown || resulUp) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Atribuir ao objeto escolhido o efeito de foco scroll.
   *
   * @param el: string
   */
  private atribuirFocoEscolhaScrollId(item: ItemScroll): void {
    // Não existe o elemento carregado na visualização
    if (document.getElementById(String(item.id)) == null) {
      this.visualizacaoFocoEscolha(item);
      // Realizar o foco na opção desejada
      setTimeout(() => {
        const el = document.getElementById(String(item.id));
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 1000);
    } else {
      // Existe o elemento carregado na visualização
      const el = document.getElementById(String(item.id));
      el.scrollIntoView();
    }
  }

  private visualizacaoFocoEscolha(item: ItemScroll): void {
    // Limpar visualização alivio de memoria
    this.arrayvisualizacao = [];
    // Usado para orientar o scrollUp quando requisitado na proxima vez.
    this.reiniciarContagemUp = true;

    const index = PjeScrollComponent.getIndex(this.recData, item);
    // Criar posições com valores de pVariavel - incremento Ex. 30 - 5 = 25
    this.posicaoIniUp = index - this.infScrollUpDistance;
    // Criar posições com valores de pVariavel - 1 Ex. 30 - 1 = 29
    this.posicaoFimUp = index  - 1;
    // Caso os valores possuam posições menores atribuir 0
    if (this.posicaoIniUp < 0 && this.posicaoFimUp < 0) {
      this.posicaoIniUp = 0;
      this.posicaoFimUp = 0;
    }
    // Resumo ScrollUP: Incrementa array com exemplo 25 até 29 na próxima rolagem.

    // Criar posições com valores de pVariavel. Ex. 30
    this.posicaoIniDown = index;
    // Criar posições com valores de pVariavel + incremento. Ex. 30 + 5 = 35
    this.posicaoFimDown = index  + this.infScrollUpDistance;
    // Resumo ScrollDown: Incrementa array com exemplo 30 até 35
    this.scrollDown(this.posicaoIniDown, this.posicaoFimDown);
  }

  private recolherVisualizacaoAll(itens: ItemScroll[], isExibirVisualizacao: boolean, itemExclude?: ItemScroll): void {
    itens.forEach(it => {
      if (it.isExibirConteudo && (itemExclude !== undefined && itemExclude.id !== it.id)) {
        it.isExibirConteudo = isExibirVisualizacao;
      }
    });
  }

  private recolherVisualizacaoRepetir(itens: ItemScroll[], iniIndex: number, fimIndex: number, isExibirVisualizacao: boolean): void {
    const itensExibirConteudo: ItemScroll[] = [];
    for (let i = iniIndex; i <= fimIndex; i++) {
      if (itens[i] !== undefined) {
        itensExibirConteudo.push(itens[i]);
      }
    }
    // Requisitar novos dados ao objeto.
    this.aoItemNextItem.emit(itensExibirConteudo);
  }

  public static recolherVisualizacaoDestaqueItem(itens: ItemScroll[], index: number, isDestaque: boolean): void {
    itens.forEach(it => {
      if (it.isDestaque) {
        it.isDestaque = false;
      }
    });

    itens[index].isDestaque = isDestaque;
  }

  public static getIndex(itens: ItemScroll[], item: ItemScroll): number {
    let index = 0;
    for (let i = 0; i <= itens.length; i++) {
      if (item.id === itens[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }
}