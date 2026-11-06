import 'package:flutter/material.dart';

// Build-proving skeleton only (Q-170): no features, no screens beyond this shell.
void main() {
  runApp(const FamilyOsApp());
}

class FamilyOsApp extends StatelessWidget {
  const FamilyOsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Family OS',
      home: Scaffold(
        body: Center(
          child: Text('Family OS'),
        ),
      ),
    );
  }
}
