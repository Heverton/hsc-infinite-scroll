import { Component, OnInit } from '@angular/core';
import { ItemScroll } from './pje-scroll/pje-scroll-item.component';
import { PjeScrollComponent } from './pje-scroll/pje-scroll.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  documentos: ItemScroll[] = [];
  itemSelecionado: ItemScroll;
  classSelecionada = '.cell-visualizador';

  constructor(public location: Location) {}

  ngOnInit(): void {

    const list = [];
    list[0] = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
    list[1] = this.location.prepareExternalUrl('/assets/1.pdf');
    list[2] = this.location.prepareExternalUrl('/assets/2.pdf');
    // list[3] = this.location.prepareExternalUrl('/assets/3.pdf');
    // list[4] = this.location.prepareExternalUrl('/assets/4.pdf');
    // list[5] = this.location.prepareExternalUrl('/assets/5.pdf');
    // list[6] = this.location.prepareExternalUrl('/assets/6.pdf');

    this.documentos.push(new ItemScroll(0, list[0], true, true));
    for ( let cont = 1; cont < 200 ; cont++) {
      const n = Math.floor(Math.random() * 7);
      this.documentos.push(new ItemScroll(cont));
    }

    setTimeout(() => {
      for ( let cont = 200; cont < 400 ; cont++) {
        const n = Math.floor(Math.random() * 7);
        this.documentos.push(new ItemScroll(cont, list[2]));
      }
    }, 10000);
  }

  selecionadoItem(item: ItemScroll) {
    this.itemSelecionado = this.buscarItem(item);
  }

  receberItemSelecionado(item: ItemScroll) {
    const index = PjeScrollComponent.getIndex(this.documentos, item);
    PjeScrollComponent.recolherVisualizacaoDestaqueItem(this.documentos, index, true);
  }

  receberNextItem(itens: ItemScroll[]) {
    itens.forEach(it => {
      this.buscarItem(it);
    });
  }

  private buscarItem(item: ItemScroll): ItemScroll {
    const index = PjeScrollComponent.getIndex(this.documentos, item);

    if (!item.conteudo) {
      this.documentos[index].conteudo = this.location.prepareExternalUrl('/assets/2.pdf');
    }

    setTimeout(() => {
      this.documentos[index].isExibirConteudo = true;
    }, 3000);

    return this.documentos[index];
  }

}
