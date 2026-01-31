<?php

$to = 'joe.taxi94@gmail.com';

if (empty($_POST["nom"]))  {

    echo 'Tous les champs sont obligatoires. Cliquez <a href="./index.html">ici</a> pour revenir à la page d\'accueil.';

    exit;

}

$nom = htmlspecialchars($_POST["nom"]);

$telephone = htmlspecialchars($_POST["telephone"]);

$mail = htmlspecialchars($_POST["email"]);

$depart = htmlspecialchars($_POST["depart"]);

$arrive = htmlspecialchars($_POST["arrive"]);

$date = htmlspecialchars($_POST["date"]);

$personne = htmlspecialchars($_POST["personne"]);

$bagage = htmlspecialchars($_POST["bagage"]);

$type = htmlspecialchars($_POST["type"]);

$textarea = htmlspecialchars($_POST["commentaire"]);

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {

    echo 'Adresse email invalide. Cliquez <a href="./index.html">ici</a> pour revenir à la page d\'accueil.';

    exit;

}

$headers = "MIME-Version: 1.0\r\n";

$headers .= "Content-type: text/plain; charset=UTF-8\r\n";

$headers .= "From: 'joe.taxi@taxiconventionné94.com\r\n";

$headers .= "Reply-To: $mail\r\n";

$message = "Nom: $nom\n";

$message .= "Téléphone: $telephone\n";

$message .= "Email: $mail\n";

$message .= "Départ: $depart\n";

$message .= "Arrivée: $arrive\n";

$message .= "Date: $date\n";

$message .= "Personne(s): $personne\n";

$message .= "Bagage: $bagage\n";

$message .= "Type: $type\n";

$message .= "Message: $textarea\n";

if(mail($to, 'Demande de réservation  JoeTaxi', $message)) {

    echo "<p>Merci <strong>$nom</strong> ($mail), votre message a bien été transmis. Nous vous répondrons dans les plus brefs délais.</p>";

    echo '<p><a href="../index.html">Retour à la page d\'accueil</a></p>';

} else {

    echo 'Erreur lors de l\'envoi du mail.';

}

?>