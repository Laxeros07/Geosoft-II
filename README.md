# Geosoft-II Apollo13

Das Projekt stellt eine einfache Schnittstelle zum Benutzen der AOA (Area of Applicability). 

Dockerimage im Readme anpassen.

----------- Ab hier beginnt das offizielle Readme ----------------------------

Dies ist das Repo zum Kurs Geosoft II und dem Projekt Apollo 13 der Firma Spacey.
Entwickelt wurde diese von den folgenden Personen:
* Felix Disselkamp
* Eva Langstein
* Philipp Mundinger
* Robert Schmitz
* Anne Staskiewicz

## Ziel und Zweck

Mit unserer Webanwendung können Sie Satellitendaten klassifizieren und die AOA berechnen.
Die Daten können im Anschluss bearbeitet werden, um eine größere AOA zu erreichen. Der Algorithmus gibt Ihnen dafür Gebiete aus, in denen weitere Trainingsdaten erstellt werden können. So wird das Modell immer besser.

## Installation

Starten mit Docker:
nutzen Sie bitte das **felioxx/geosoft2image**, welches Sie mit docker pull laden können, und starten Sie mit **docker compose up** (auch unter Rechtsklick auf die docker-compose.yml Datei).

# Workflow
## Schritt 1: Willst du Trainingspolygone oder ein Fertiges Modell hochladen?
![grafik](https://user-images.githubusercontent.com/102729357/215824118-e502d007-78ea-4be7-880f-98bc749df30f.png)

## Schritt 2: Lade deine Trainingsdaten oder das Trainierte Modell:
![grafik](https://user-images.githubusercontent.com/102729357/215825515-7809553b-6976-4ac9-bcf0-990c05fad3b5.png)

## Schritt 3: Rasterdaten einladen:
Lade deine Satellitendaten ein, auf denen du die Klassifizierung anwenden willst.
![grafik](https://user-images.githubusercontent.com/102729357/215827242-28b8e575-9157-40f4-8245-e63eb629c6a8.png)

In der Karte kann nach dem Einladen der Rasterdaten eine Boundingbox, für das Festlegen einer Area of Interest, festgelegt werden.

## Schritt 4: Unterscheidung zwischen Trainingsdaten und einem Modell:
Basierend auf deiner Entscheidung, ob du Trainingsdaten oder ein Modell ausgewählt hast, ändern sich die folgenden Schritte

### Schritt 4.1: Trainingsdaten:
Entscheide dich für einen der beiden Algorithmen (Random Forrest oder Decision Tree).
Random Forrest: lege eine Anzahl und die Tiefe der Bäume fest.

![grafik](https://user-images.githubusercontent.com/102729357/215829306-8ee80cc5-ce89-4544-9685-25cbfbde1f34.png)

### Schritt 4.2: Modell:
Über die Scral-Bar hast du die Möglichkeit, die Anzahl benutzter Trainingsdaten zu variieren.

![grafik](https://user-images.githubusercontent.com/102729357/215829717-804353fd-9f81-448c-b039-1fad3e365531.png)

### Schritt 5: Ergebnis Seite:
Nach der Ausführung der vorherigen Prozesse, gelangt ihr automatisch auf die Result Page.
Hier könnt ihr euche die Ergebnisse der AOA angucken und die verschiedenen Layer auswählen.

Unter anderem wird auf der Seite auch der Dissimliartiy Index angegeben. An diesem kann erkannt werden in welchen Bereichen noch Trainingspolygone fehlen.

## 5.1 Ergebnis verbessern: 
Falls ihr mit dem Ergebnis so noch nicht zu frieden seid, könnt Ihr in dem Bereich "Trainingsdaten bearbeiten" die Trainingspolygone bearbeiten oder an fehlenden Stellen ergänzen.
Nach dem dies geschehen ist, müssen die neu erstellten Polygone hochgeladen werden, damit die Klassifizierung anschließend noch einmal durchgeführt werden kann.
Dieser Schritt kann beliebig oft wiederholt werden.

## Output 
Als Output stehen nachher..
* Klassifikation
* Area of Applicability
* Trainingspolygone
* Modell
* Dissimilarity Index
* AOA Differenz

..zur Verfügung 

![grafik](https://user-images.githubusercontent.com/102729357/215838001-53eaaeb5-31b7-4b1d-bf84-f4fbf2593af6.png)



# Lizenz

Unsere Software folgt den Open Source Prinzipien und unterliegt der MIT Lizenz. Nutzern ist es erlaubt, die Software zu verwenden und zu bearbeiten, solange sie uns per Copyright Trademark angeben. Mehr Informationen dazu [hier](https://opensource.org/licenses/MIT)

Viel Erfolg beim Klassifizieren!

Ihr Spacey Team

