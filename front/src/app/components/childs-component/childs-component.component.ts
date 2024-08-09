import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: `testButton`,
  standalone: true,
  imports: [RouterLink],
  template: `
    <main id="button">
      <button class="primary" routerLink="/">Primary</button>
      <button class="success" routerLink="/">Success</button>
      <button class="warning" routerLink="/">Warning</button>
      <button class="danger" routerLink="/">Danger</button>
      <button disabled="true" routerLink="/">Disabled</button>
    </main>
    <main id="cards">
      <div class="card card-3x4 card-white">
        <div class="content">
          <h1 class="title">Explanation</h1>
          <p>
            This website uses Riot Games' Valorant API, and this page was
            created as a landing page and as a way of learning UI UX and design
            in general, and this route is just a place to show the components
            created by me.
          </p>
          <div class="card">
            <div
              class="content"
              style="width: 100%; height: 100%;
              display: flex; justify-content: center; align-items: center"
            >
              <a
                href="https://valorant-api.com"
                target="_blank"
                rel="noopener noreferrer"
                style="text-decoration: none; color: #0e121a"
                ><h3>Valorant API</h3></a
              >
            </div>
          </div>
          <div class="card">
            <div
              class="content"
              style="width: 100%; height: 100%;
              display: flex; justify-content: center; align-items: center"
            >
              <a
                href="https://github.com/guigasprog"
                target="_blank"
                rel="noopener noreferrer"
                style="text-decoration: none; color: #0e121a"
                ><h3>GitHub</h3></a
              >
            </div>
          </div>
        </div>
      </div>
      <div class="card card-3x4 card-yellow">
        <div class="content">
          <h1 class="title">Letter, Numeric and Symbols</h1>
          <p>
            This card was created with the intention of leaving most characters
            to see the use of the font.
          </p>
          <h5>Font: Barlow</h5>
          <div class="card">
            <div class="content">
              <h1 class="title">Letter</h1>
              <p>A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</p>
              <p>a b c d e f g h i j k l m n o p q r s t u v w x y z</p>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1 class="title">Numeric</h1>
              <p>1 2 3 4 5 6 7 8 9 0</p>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1 class="title">Symbols</h1>
              <p>- + = * & ^ % $ # ! ~ | / ? > < , . ; : ' " _ ( ) [ ]</p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="card card-5x4 card-green"
        style="width: 350px;
  height: 300px; overflow: visible"
      >
        <div class="content">
          <div class="profile">
            <div class="card" style="background-color: transparent;">
              <div class="content center">
                <a
                  href="https://www.instagram.com/guigapenas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="text-decoration: none; color: #0e121a"
                  ><h3>Guilherme</h3></a
                >
              </div>
            </div>
            <div class="card card-black" style="padding: 0px;">
              <div class="content center"><h4>Developer and designer</h4></div>
            </div>
          </div>
          <div class="profile">
            <div
              class="card"
              style="background-color: transparent; padding-top: 0px; padding-bottom: 0px; margin: 0"
            >
              <h5>
                19 y.o. - Student and Developer Intern <br />
                Contact: guilherme.d.martins&#64;outlook.com
              </h5>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1>Programming Language</h1>
              <li>Javascript/Typescript</li>
              <li>Java</li>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1>Frameworks</h1>
              <li>Angular</li>
              <li>Spring-boot</li>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1>Database</h1>
              <li>PostgreSQL</li>
            </div>
          </div>
          <div class="card">
            <div class="content">
              <h1>Others</h1>
              <li>Clean Arch</li>
              <li>Clean Code</li>
              <li>PrimeNG</li>
              <li>Bootstrap</li>
              <li>React(Intermediary)</li>
              <li>Ionic</li>
              <li>Angular Material</li>
              <li>Java Persistence API(JPA)</li>
              <li>Agile Scrum Methodology</li>
              <li>Soft Skills</li>
              <li>TeamWork</li>
              <li>Constant learning</li>
              <li>Clean Arch</li>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: `
    #button {
      width: 100%;
      height: 15%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
    }
    #cards {
      width: 100%;
      height: 70%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
    }
    .profile {
      display: flex;
    }
  `,
})
export class ButtonComponent {}
