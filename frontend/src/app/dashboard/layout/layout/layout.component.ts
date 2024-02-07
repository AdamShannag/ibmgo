import { afterNextRender, Component, OnDestroy, Renderer2, ViewChild, } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { DashboardLayoutService } from '../service/layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { AppConfigComponent } from '../config/app.config.component';
import { FooterComponent } from '../footer/footer.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { ChipsModule } from "primeng/chips";
import { LoadingComponent } from "../../../shared/components/loading/loading.component";
import { LoadingService } from "../../../shared/components/loading/loading.service";
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppConfigComponent,
    FooterComponent,
    SidebarComponent,
    TopbarComponent,
    ProgressSpinnerModule,
    DialogModule,
    ButtonModule,
    ChipsModule,
    LoadingComponent,
    ToastModule
  ],
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnDestroy {
  overlayMenuOpenSubscription!: Subscription;

  menuOutsideClickListener: any;

  profileMenuOutsideClickListener: any;

  @ViewChild(SidebarComponent) appSidebar!: SidebarComponent;

  @ViewChild(TopbarComponent) appTopbar!: TopbarComponent;
  constructor(
    public layoutService: DashboardLayoutService,
    public renderer: Renderer2,
    public router: Router,
  ) {
    afterNextRender(() => {
      this.overlayMenuOpenSubscription =
        this.layoutService.overlayOpen$.subscribe(() => {
          if (!this.menuOutsideClickListener) {
            this.menuOutsideClickListener = this.renderer.listen(
              'document',
              'click',
              (event) => {
                const isOutsideClicked = !(
                  this.appSidebar.el.nativeElement.isSameNode(event.target) ||
                  this.appSidebar.el.nativeElement.contains(event.target) ||
                  this.appTopbar.menuButton.nativeElement.isSameNode(
                    event.target
                  ) ||
                  this.appTopbar.menuButton.nativeElement.contains(event.target)
                );

                if (isOutsideClicked) {
                  this.hideMenu();
                }
              }
            );
          }

          if (!this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener = this.renderer.listen(
              'document',
              'click',
              (event) => {
                const isOutsideClicked = !(
                  this.appTopbar.menu.nativeElement.isSameNode(event.target) ||
                  this.appTopbar.menu.nativeElement.contains(event.target) ||
                  this.appTopbar.topbarMenuButton.nativeElement.isSameNode(
                    event.target
                  ) ||
                  this.appTopbar.topbarMenuButton.nativeElement.contains(
                    event.target
                  )
                );

                if (isOutsideClicked) {
                  this.hideProfileMenu();
                }
              }
            );
          }

          if (this.layoutService.state.staticMenuMobileActive) {
            this.blockBodyScroll();
          }
        });

      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.hideMenu();
          this.hideProfileMenu();
        });
    });
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  hideProfileMenu() {
    this.layoutService.state.profileSidebarVisible = false;
    if (this.profileMenuOutsideClickListener) {
      this.profileMenuOutsideClickListener();
      this.profileMenuOutsideClickListener = null;
    }
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  get containerClass() {
    return {
      'layout-overlay': this.layoutService.config().menuMode === 'overlay',
      'layout-static': this.layoutService.config().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.state.staticMenuDesktopInactive &&
        this.layoutService.config().menuMode === 'static',
      'layout-overlay-active': this.layoutService.state.overlayMenuActive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.config().inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.config().ripple,
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
