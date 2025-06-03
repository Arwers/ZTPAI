from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='account',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='account',
            name='updated_at',
        ),
    ]
