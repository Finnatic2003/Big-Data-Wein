# Big-Data-Wein
Autoren:  
Thanadon Chiangkham (9002977)  
Lars Lönne (1412338)  
Nils Loomans (4850429)  
Finn Münstermann (3071508)  
Jan Waldmann (7952189)

 
# Dokumentation der Wein Anwendung
## 1. Idee der Anwendung
Unsere Anwendung ist eine einfache Darstellung der Weinnachfrage. Ziel dabei war eine Umsetzung, die auf Big Data Technologien basiert und dabei insbesondere Apache Spark und eine Kappa-Architektur verwendet.

## 2. Systemarchitektur
Die Architektutr der Systeme wird über das Attachment dargestellt
![image](https://github.com/user-attachments/assets/bb133be5-1f42-43f5-8e54-981c9a335f99)


## 3. Implementierung

### 3.1 Ingestion Layer
Apache Kafka mit Strimzi: Die Implementierung beginnt mit der Bereitstellung eines Kafka-Clusters in Kubernetes mittels Strimzi. Strimzi ist ein Operator für das Management von Kafka in Kubernetes und ermöglicht die einfache Bereitstellung und Verwaltung eines Kafka-Clusters innerhalb eines Kubernetes-Clusters.  

•	Kafka-Producer: Ein Kafka-Producer sendet Klickdaten an ein Kafka-Topic. Diese Daten repräsentieren Benutzerinteraktionen mit den Produkten, beispielsweise das Klicken auf Produktlinks.  

•	Kafka-Cluster: Der Kafka-Cluster läuft auf Kubernetes und wird durch Strimzi verwaltet. Dies bietet hohe Verfügbarkeit und Skalierbarkeit, da Kafka in einem verteilten System betrieben wird.

### 3.2 Stream Processing Layer

•	Apache Spark: Ein Spark-Job liest die Klickdaten kontinuierlich von Kafka und verarbeitet diese. Die Nachfrage nach den Produkten wird anhand der Anzahl der Klicks dynamisch angepasst.  

•	Hadoop: Hadoop wird genutzt, um historische Klickdaten zu speichern. Diese Daten werden für Batch-Processing und tiefere Analysen verwendet. Durch die Speicherung in einem Hadoop-basierten Data Lake können umfangreiche Datenmengen effizient gespeichert und verarbeitet werden.

### 3.3 Serving Layer
MariaDB: Die Nachfragedaten werden in eine MariaDB-Datenbank geschrieben. Diese Datenbank speichert die aktuelle Nachfrage der Produkte und dient als Backend für die Web-UI.

•	Datenpersistenz: Die Speicherung der Nachfragedaten erfolgt in einer strukturierten Form, die schnelle Lesezugriffe ermöglicht.  

•	Integration mit Spark: Spark schreibt die Nachfragedaten direkt in die MariaDB-Datenbank, was eine zeitnahe Aktualisierung der Nachfragedaten gewährleistet.

### 3.4 Web-UI
Web-UI-Entwicklung: Eine Webanwendung wurde entwickelt, die die aktuelle Nachfrage der Produkte anzeigt. Diese Anwendung ruft die Daten aus der MariaDB-Datenbank ab.

### 3.5 Skaffold
In unserem Projekt haben wir Skaffold verwendet, um das gesamte Cluster und die erforderlichen Komponenten zu starten und zu verwalten. Skaffold ermöglichte es uns, die Kubernetes-Ressourcen für Apache Kafka mit Strimzi, Apache Spark Streaming und MariaDB effizient bereitzustellen. Wir haben Skaffold konfiguriert, um die verschiedenen Docker-Images zu bauen und zu verteilen, die für die Anwendung erforderlich waren, einschließlich der Kafka-Producer, Spark-Jobs und der MariaDB-Datenbank.

### 3.6 Technologien
### Docker
•	Container für Minikube 


•	Basis für Cluster über Kubernetes
### Minikube
• Testen und Entwickeln von Kubernetes Cluster

• Lokale Bereitstellung der Cluster 
### Kafka
• Verteilte Evenets

• Kommuniziert mit Spark
### Strimzi
• Stellt Apache Kafka bereit

• Verwaltet Kafka Cluster und Broker
### Spark
• Engine für Datenverarbeitung
### Hadoop
• Würde große Datenmengen verarbeiten (Unsere Daten jedoch relativ gering)
### MariaDB
• Speichereung der Logs 

• Spark schreibt die übertragenen Logs in Maria DB rein

## 4. Herausforderungen

Aufgrund der Arbeitslaptops die leider wenig Rechenleistung zur Verfügung haben, läuft es nicht ohne zu crashen.

![image](https://github.com/user-attachments/assets/9a0fd5c7-de05-495d-adc4-15dbce34ed03)
![image](https://github.com/user-attachments/assets/e4f9f4f9-b1a7-478d-9b0a-04909b783ff0)

Außerdem zwingt es uns dazu, nach jedem skaffold dev, mehrere Minuten zu warten, was die debugging Arbeit noch erschwert.


Es wurde jedoch auf dem Laptop eines Komilitonen getestet sodass es läuft.

![image](https://github.com/user-attachments/assets/9f8efbf3-423a-4a58-a7f2-fd2b1c45b5cc)

Screencast ebenfalls auf dem Laptop eines Komilitionen erstellt.
Hier Screencast link
