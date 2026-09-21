#!/bin/bash

# Script per creare una build nativa iOS per iPad
# Assicurati di avere un account Expo (gratuito) prima di iniziare

set -e

echo "🚀 Build Nativa iOS per iPad"
echo "================================"
echo ""

# Controlla se EAS CLI è installato
if ! command -v eas &> /dev/null; then
    echo "📦 Installo EAS CLI..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI già installato"
fi

echo ""
echo "🔐 Effettua il login ad Expo"
echo "(Serve un account gratuito su expo.dev)"
echo ""
eas login

echo ""
echo "⚙️  Configurazione progetto..."
eas build:configure

echo ""
echo "🎯 Creazione build iOS per iPad..."
echo ""
echo "Durante il processo:"
echo "1. Ti verrà chiesto di registrare il tuo iPad"
echo "2. Apri il link fornito DALL'IPAD"
echo "3. Installa il profilo di provisioning"
echo ""
read -p "Premi INVIO per continuare..."

echo ""
echo "🏗️  Avvio build (ci vorranno 10-20 minuti)..."
eas build --platform ios --profile development

echo ""
echo "✅ Build completata!"
echo ""
echo "📱 Prossimi passi:"
echo "1. Riceverai un link via email"
echo "2. Apri il link dall'iPad"
echo "3. Premi 'Install'"
echo "4. Autorizza il certificato in Impostazioni > Generale > Gestione Dispositivo"
echo ""
echo "🎉 Buon divertimento con l'app!"
